/**
 * Create the Porterhouse Beef Steak variable product and its pack-size options.
 *
 * Existing simple products are intentionally left untouched for reference.
 *
 * Usage:
 *   node scripts/create-porterhouse-variable-product.cjs            # apply
 *   node scripts/create-porterhouse-variable-product.cjs --dry-run  # inspect
 */
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const API_URL = process.env.PAYLOAD_API_URL || 'https://cms.tap2goph.com/api';
const API_KEY = process.env.PAYLOAD_API_KEY;
const VENDOR_ID = 31;
const MERCHANT_ID = 31;
const PARENT_NAME = 'Porterhouse Beef Steak';
const CATEGORY_NAME = 'Main Courses';
const ATTRIBUTE_NAME = 'Pack Size';
const ATTRIBUTE_SLUG = 'pack-size';
const DRY_RUN = process.argv.includes('--dry-run');

const VARIATIONS = [
  { name: '4 slices, 1kg', price: 1359, termSlug: '4-slices-1kg' },
  { name: '4 slices, 490g', price: 759, termSlug: '4-slices-490g' },
  { name: '3 slices, 320g', price: 506, termSlug: '3-slices-320g' },
  { name: '4 slices, 240g', price: 385, termSlug: '4-slices-240g' },
];

function relationId(value) {
  if (value && typeof value === 'object') return Number(value.id);
  return Number(value);
}

async function api(method, endpoint, body) {
  const res = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `users API-Key ${API_KEY}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }
  if (!res.ok) {
    throw new Error(`API ${method} ${endpoint} -> ${res.status}: ${text.slice(0, 500)}`);
  }
  return data;
}

async function findDocs(collection, filters, limit = 10) {
  const query = filters
    .map(([field, value]) => `where[${field}][equals]=${encodeURIComponent(String(value))}`)
    .join('&');
  return api('GET', `/${collection}?${query}&limit=${limit}&depth=0`);
}

async function findOne(collection, filters) {
  const result = await findDocs(collection, filters, 1);
  return result?.docs?.[0] || null;
}

async function ensureDoc(collection, filters, data, label) {
  const existing = await findOne(collection, filters);
  if (existing) {
    console.log(`  -> ${label} already exists (id ${existing.id}).`);
    return existing;
  }
  if (DRY_RUN) {
    console.log(`  [dry-run] Would create ${label}.`);
    return null;
  }
  const result = await api('POST', `/${collection}`, data);
  const doc = result?.doc;
  if (!doc?.id) {
    throw new Error(`Creating ${label} returned no document ID.`);
  }
  console.log(`  -> Created ${label} (id ${doc.id}).`);
  return doc;
}

async function main() {
  if (!API_KEY) {
    throw new Error('PAYLOAD_API_KEY is not set. Cannot authenticate with the CMS.');
  }
  if (DRY_RUN) console.log('DRY RUN MODE - no changes will be written.\n');

  const merchant = await findOne('merchants', [['id', MERCHANT_ID]]);
  if (!merchant) throw new Error(`Merchant ${MERCHANT_ID} does not exist.`);
  if (relationId(merchant.vendor) !== VENDOR_ID) {
    throw new Error(`Merchant ${MERCHANT_ID} is not owned by vendor ${VENDOR_ID}.`);
  }

  const category = await findOne('product-categories', [['name', CATEGORY_NAME]]);
  if (!category) throw new Error(`Product category "${CATEGORY_NAME}" does not exist.`);

  let parent = await findOne('products', [
    ['createdByVendor', VENDOR_ID],
    ['name', PARENT_NAME],
  ]);
  if (parent && parent.productType !== 'variable') {
    throw new Error(
      `A vendor ${VENDOR_ID} product named "${PARENT_NAME}" already exists as ${parent.productType}; refusing to repurpose it.`
    );
  }

  if (parent) {
    console.log(`Variable parent already exists (id ${parent.id}).`);
  } else if (DRY_RUN) {
    console.log(`[dry-run] Would create variable parent "${PARENT_NAME}" for vendor ${VENDOR_ID}.`);
  } else {
    const result = await api('POST', '/products', {
      createdByVendor: VENDOR_ID,
      productType: 'variable',
      name: PARENT_NAME,
      slug: 'porterhouse-beef-steak',
      categories: [category.id],
      assign_to_all_vendor_merchants: false,
    });
    parent = result?.doc || null;
    if (!parent?.id) throw new Error('Creating the variable parent returned no document ID.');
    console.log(`Created variable parent (id ${parent.id}).`);
  }

  const attributeByName = await findOne('prod-attributes', [['name', ATTRIBUTE_NAME]]);
  let attribute = attributeByName;
  if (attribute && attribute.slug !== ATTRIBUTE_SLUG) {
    throw new Error(`Attribute "${ATTRIBUTE_NAME}" exists with unexpected slug "${attribute.slug}".`);
  }
  if (!attribute) {
    const attributeBySlug = await findOne('prod-attributes', [['slug', ATTRIBUTE_SLUG]]);
    if (attributeBySlug) {
      throw new Error(`Attribute slug "${ATTRIBUTE_SLUG}" is already used by "${attributeBySlug.name}".`);
    }
    attribute = await ensureDoc(
      'prod-attributes',
      [['name', ATTRIBUTE_NAME]],
      { name: ATTRIBUTE_NAME, slug: ATTRIBUTE_SLUG, type: 'select', is_active: true },
      `attribute "${ATTRIBUTE_NAME}"`
    );
  } else {
    console.log(`Attribute "${ATTRIBUTE_NAME}" already exists (id ${attribute.id}).`);
  }

  const merchantProduct = parent
    ? await findOne('merchant-products', [
        ['merchant_id', MERCHANT_ID],
        ['product_id', parent.id],
      ])
    : null;
  if (merchantProduct) {
    console.log(`Merchant-product link already exists (id ${merchantProduct.id}).`);
  } else if (DRY_RUN) {
    console.log(`[dry-run] Would link the variable parent to merchant ${MERCHANT_ID}.`);
  }

  for (let index = 0; index < VARIATIONS.length; index += 1) {
    const item = VARIATIONS[index];
    console.log(`\nOption: ${item.name} — ₱${item.price.toFixed(2)}`);

    const term = attribute
      ? await ensureDoc(
          'prod-attribute-terms',
          [['attribute_id', attribute.id], ['name', item.name]],
          {
            attribute_id: attribute.id,
            name: item.name,
            slug: item.termSlug,
            sort_order: index,
            is_active: true,
          },
          `Pack Size term "${item.name}"`
        )
      : null;

    const variation = parent
      ? await findOne('prod-variations', [
          ['product_id', parent.id],
          ['name', item.name],
        ])
      : null;

    let variationDoc = variation;
    if (variationDoc) {
      if (Number(variationDoc.base_price) !== item.price) {
        throw new Error(
          `Variation "${item.name}" already exists with price ${variationDoc.base_price}; expected ${item.price}.`
        );
      }
      console.log(`  -> Variation already exists (id ${variationDoc.id}).`);
    } else if (parent && !DRY_RUN) {
      const result = await api('POST', '/prod-variations', {
        product_id: parent.id,
        name: item.name,
        modifier_behavior_mode: 'inherit_product',
        base_price: item.price,
        stock_quantity: 0,
        is_used_for_variations: true,
        is_visible: true,
        sort_order: index,
      });
      variationDoc = result?.doc || null;
      if (!variationDoc?.id) {
        throw new Error(`Creating variation "${item.name}" returned no document ID.`);
      }
      console.log(`  -> Created variation (id ${variationDoc.id}); stock is 0 pending inventory setup.`);
    } else {
      console.log('  [dry-run] Would create variation with this price and zero stock.');
    }

    if (variationDoc && attribute && term) {
      const values = await findDocs('prod-variation-values', [
        ['variation_id', variationDoc.id],
        ['attribute_id', attribute.id],
      ]);
      const existingValue = values?.docs?.[0] || null;
      if (existingValue) {
        if (relationId(existingValue.term_id) !== relationId(term.id)) {
          if (DRY_RUN) {
            console.log('  [dry-run] Would update the variation’s Pack Size value.');
          } else {
            await api('PATCH', `/prod-variation-values/${existingValue.id}`, { term_id: term.id });
            console.log('  -> Updated the variation’s Pack Size value.');
          }
        } else {
          console.log(`  -> Pack Size value already exists (id ${existingValue.id}).`);
        }
      } else if (DRY_RUN) {
        console.log('  [dry-run] Would link the variation to its Pack Size term.');
      } else {
        const result = await api('POST', '/prod-variation-values', {
          variation_id: variationDoc.id,
          attribute_id: attribute.id,
          term_id: term.id,
        });
        if (!result?.doc?.id) {
          throw new Error(`Linking variation "${item.name}" to Pack Size returned no document ID.`);
        }
        console.log(`  -> Linked variation to Pack Size term (id ${result.doc.id}).`);
      }
    }
  }

  if (parent && !merchantProduct && !DRY_RUN) {
    const result = await api('POST', '/merchant-products', {
      merchant_id: MERCHANT_ID,
      product_id: parent.id,
      added_by: 'vendor',
      price_override: null,
      stock_quantity: 0,
    });
    if (!result?.doc?.id) throw new Error('Creating the merchant-product link returned no document ID.');
    console.log(`\nCreated merchant-product link (id ${result.doc.id}).`);
  }

  if (DRY_RUN) {
    console.log('\nDRY RUN complete. No changes were written.');
  } else {
    console.log('\nVariable product setup complete. Existing simple products were not changed or deleted.');
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
