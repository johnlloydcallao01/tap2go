import { describe, expect, it, vi } from 'vitest'
import { getProductTags, syncProductTags, validateProductTagIds } from '../../src/services/productTags'

function makePayload(options: {
  junctions?: Array<Record<string, any>>
  tags?: Array<Record<string, any>>
} = {}) {
  const junctions = options.junctions || []
  const tags = options.tags || []
  const find = vi.fn(async ({ collection }: { collection: string }) => ({
    docs: collection === 'prod-tags-junction' ? junctions : collection === 'prod-tags' ? tags : [],
  }))
  const create = vi.fn(async ({ data }: { data: Record<string, unknown> }) => ({ id: 100, ...data }))
  const remove = vi.fn(async () => ({}))
  return { find, create, delete: remove }
}

describe('product tag assignments', () => {
  it('returns unique sanitized tags from the product junctions', async () => {
    const payload = makePayload({
      junctions: [
        { tag_id: { id: 4, name: 'Spicy', slug: 'spicy', tag_type: 'spice_level', is_active: true } },
        { tag_id: { id: 4, name: 'Spicy', slug: 'spicy', tag_type: 'spice_level', is_active: true } },
      ],
    })

    await expect(getProductTags(payload as never, 12)).resolves.toEqual([
      { id: 4, name: 'Spicy', slug: 'spicy', tag_type: 'spice_level', color: null, is_active: true },
    ])
  })

  it('reconciles selected tags and attributes new junctions to the vendor', async () => {
    const payload = makePayload({
      junctions: [
        { id: 1, tag_id: 4 },
        { id: 2, tag_id: 5 },
      ],
      tags: [{ id: 6, is_active: true }],
    })

    await syncProductTags(payload as never, 12, [4, 6], { type: 'vendor', vendorId: 7 })

    expect(payload.delete).toHaveBeenCalledTimes(1)
    expect(payload.delete).toHaveBeenCalledWith(expect.objectContaining({ id: 2 }))
    expect(payload.create).toHaveBeenCalledWith(expect.objectContaining({
      collection: 'prod-tags-junction',
      data: expect.objectContaining({
        product_id: 12,
        tag_id: 6,
        added_by_type: 'vendor',
        added_by_vendor_id: 7,
      }),
    }))
  })

  it('rejects new inactive or unknown tags before product changes', async () => {
    const payload = makePayload({ tags: [] })

    await expect(validateProductTagIds(payload as never, 12, [999]))
      .rejects.toThrow('One or more selected tags are unavailable.')
  })
})
