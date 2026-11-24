/**
 * Remove the remaining GMK vendor login and its related customer records.
 *
 * Usage:
 *   pnpm exec tsx scripts/remove-gmk-cafes-login-account.ts
 *   pnpm exec tsx scripts/remove-gmk-cafes-login-account.ts --apply
 */
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
import { getPayload, type CollectionSlug, type Where } from 'payload'

const dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(dirname, '../.env') })

const USER_ID = 48
const APPLY = process.argv.includes('--apply')

async function main() {
  if (!APPLY) console.log('DRY RUN MODE - no changes will be written.\n')

  const { default: config } = await import('../src/payload.config')
  const payload = await getPayload({ config })

  const findRelated = async (collection: CollectionSlug, field: string, value: number) => {
    const result = await payload.find({
      collection,
      where: { [field]: { equals: value } } as Where,
      limit: 1000,
      depth: 0,
      overrideAccess: true,
    })
    if (result.totalDocs > result.docs.length) {
      throw new Error(`Query for ${collection} returned truncated results; refusing account deletion.`)
    }
    return result.docs
  }

  const user = await payload.findByID({
      collection: 'users',
      id: USER_ID,
      depth: 0,
      overrideAccess: true,
    })
    if (user.role !== 'vendor') {
      throw new Error(`User ${USER_ID} has role "${user.role}", not vendor; refusing deletion.`)
    }

    const vendors = await findRelated('vendors', 'user', USER_ID)
    if (vendors.length) {
      throw new Error(`User ${USER_ID} is still linked to ${vendors.length} vendor record(s); refusing deletion.`)
    }

    const [customers, addresses, emergencyContacts] = await Promise.all([
      findRelated('customers', 'user', USER_ID),
      findRelated('addresses', 'user', USER_ID),
      findRelated('emergency-contacts', 'user', USER_ID),
    ])
    if (customers.length > 1) {
      throw new Error(`Expected at most one customer profile for user ${USER_ID}, found ${customers.length}.`)
    }

    for (const customer of customers) {
      const [orders, cartItems, reviews] = await Promise.all([
        findRelated('orders', 'customer', Number(customer.id)),
        findRelated('cart-items', 'customer', Number(customer.id)),
        findRelated('reviews', 'customer', Number(customer.id)),
      ])
      if (orders.length || cartItems.length || reviews.length) {
        throw new Error(
          `Customer profile ${customer.id} has ${orders.length} order(s), ${cartItems.length} cart item(s), and ${reviews.length} review(s); refusing deletion.`
        )
      }
    }

    const userReferences: Array<[CollectionSlug, string]> = [
      ['admins', 'user'],
      ['drivers', 'user'],
      ['wishlists', 'user'],
      ['recent-views', 'user'],
      ['recent-searches', 'user'],
      ['user-notifications', 'user'],
      ['user-events', 'user'],
      ['user-events', 'triggeredBy'],
      ['notification-events', 'triggeredBy'],
      ['order-tracking', 'actor'],
      ['notification-templates', 'createdBy'],
      ['notification-templates', 'updatedBy'],
    ]

    const references = await Promise.all(
      userReferences.map(([collection, field]) => findRelated(collection, field, USER_ID))
    )
    const existingReferences = references
      .map((docs, index) => ({ collection: userReferences[index][0], field: userReferences[index][1], count: docs.length }))
      .filter(({ count }) => count > 0)
    if (existingReferences.length) {
      throw new Error(
        `User ${USER_ID} has remaining references: ${existingReferences
          .map(({ collection, field, count }) => `${collection}.${field}=${count}`)
          .join(', ')}.`
      )
    }

    console.log(
      `Verified vendor login ${USER_ID}; ${customers.length} customer profile(s) without orders, carts, or reviews, ${addresses.length} saved address(es), and ${emergencyContacts.length} emergency contact(s).`
    )

    if (!APPLY) {
      console.log('\nDRY RUN complete. Re-run with --apply to delete these related records and the login account.')
      return
    }

    for (const customer of customers) {
      await payload.delete({
        collection: 'customers',
        id: customer.id,
        overrideAccess: true,
      })
      console.log(`Deleted customer profile (id ${customer.id}).`)
    }

    for (const address of addresses) {
      await payload.delete({
        collection: 'addresses',
        id: address.id,
        overrideAccess: true,
      })
      console.log(`Deleted saved address (id ${address.id}).`)
    }

    for (const contact of emergencyContacts) {
      await payload.delete({
        collection: 'emergency-contacts',
        id: contact.id,
        overrideAccess: true,
      })
      console.log(`Deleted emergency contact (id ${contact.id}).`)
    }

    await payload.delete({
      collection: 'users',
      id: USER_ID,
      overrideAccess: true,
    })
    const remaining = await payload.find({
      collection: 'users',
      where: { id: { equals: USER_ID } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })
    if (remaining.docs.length) {
      throw new Error(`User ${USER_ID} still exists after deletion.`)
    }
  console.log(`Deleted GMK vendor login account (user id ${USER_ID}) and verified it is gone.`)
}

main()
  .then(() => {
    setTimeout(() => process.exit(0), 100)
  })
  .catch((error) => {
    console.error('Fatal error:', error)
    setTimeout(() => process.exit(1), 100)
  })
