import dotenv from 'dotenv'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import pg from 'pg'

const { Pool } = pg
const scriptDirectory = path.dirname(fileURLToPath(import.meta.url))

dotenv.config({ path: path.resolve(scriptDirectory, '../.env') })

async function approveAllProducts() {
  if (!process.env.DATABASE_URI) {
    throw new Error('DATABASE_URI is required to approve all products')
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URI,
    max: 1,
    application_name: 'tap2go-approve-all-products',
  })

  try {
    const client = await pool.connect()

    try {
      await client.query('BEGIN')
      await client.query("SET LOCAL lock_timeout = '5s'")
      await client.query("SET LOCAL statement_timeout = '5min'")

      const { rows: columnRows } = await client.query(
        `SELECT 1
         FROM information_schema.columns
         WHERE table_schema = 'public'
           AND table_name = 'products'
           AND column_name = 'approval_status'`,
      )

      if (columnRows.length === 0) {
        throw new Error('public.products.approval_status does not exist')
      }

      const { rows: enumRows } = await client.query(
        `SELECT 1
         FROM pg_type AS t
         JOIN pg_enum AS e ON e.enumtypid = t.oid
         JOIN pg_namespace AS n ON n.oid = t.typnamespace
         WHERE n.nspname = 'public'
           AND t.typname = 'enum_products_approval_status'
           AND e.enumlabel = 'approved'`,
      )

      if (enumRows.length === 0) {
        throw new Error('The product approval enum does not include approved')
      }

      await client.query(
        `ALTER TABLE public.products
         ALTER COLUMN approval_status SET DEFAULT 'approved'`,
      )
      const updateResult = await client.query(
        `UPDATE public.products
         SET approval_status = 'approved'
         WHERE approval_status IS DISTINCT FROM 'approved'`,
      )

      const { rows: verificationRows } = await client.query(
        `SELECT
           COUNT(*)::text AS total_products,
           COUNT(*) FILTER (
             WHERE approval_status IS DISTINCT FROM 'approved'
           )::text AS products_not_approved
         FROM public.products`,
      )

      const { total_products: totalProducts, products_not_approved: notApproved } =
        verificationRows[0]

      if (notApproved !== '0') {
        throw new Error(`Verification failed: ${notApproved} products are not approved`)
      }

      await client.query('COMMIT')
      console.log(`Updated ${updateResult.rowCount} product(s) to approved.`)
      console.log(`Verified ${totalProducts} product(s); all are approved.`)
      console.log('The database default for new products is now approved.')
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  } finally {
    await pool.end()
  }
}

approveAllProducts().catch((error) => {
  console.error('Failed to approve products:', error)
  process.exitCode = 1
})
