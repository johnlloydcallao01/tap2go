/**
 * Add products for LADYMARJYN FOOD HUB to the CMS.
 *
 * For each product in the list below this script:
 *  1. Creates a Product in the `products` collection:
 *     - createdByVendor = 28 (LADYMARJYN FOOD HUB)
 *     - productType = 'simple' (Simple Product)
 *     - name, slug (derived from name), categories (matched by name),
 *       basePrice (from the price column), sku (name + product id, uppercased)
 *  2. Creates a Merchant Product in the `merchant-products` collection:
 *     - merchant_id = 30 (LADYMARJYN FOOD HUB)
 *     - product_id = the product created above
 *     - added_by = 'vendor'
 *
 * Usage:
 *   node scripts/add-ladymarjyn-products.cjs            # perform the insertion
 *   node scripts/add-ladymarjyn-products.cjs --dry-run  # print plan only
 *
 * The script is idempotent: products already owned by vendor 28 with the same
 * name are skipped (and their merchant product is created if missing).
 */
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const API_URL = process.env.PAYLOAD_API_URL || 'https://cms.tap2goph.com/api';
const API_KEY = process.env.PAYLOAD_API_KEY;

const VENDOR_ID = 28; // LADYMARJYN FOOD HUB
const MERCHANT_ID = 30; // LADYMARJYN FOOD HUB

const DRY_RUN = process.argv.includes('--dry-run');

// Product list: [name, price in PHP]
const PRODUCTS = [
  ['Flavored Chicken Roasted ( Half )', 207.0],
  ['Flavored Chicken roasted Whole', 357.0],
  ['Flavored Chicken BBQ half', 219.0],
  ['Flavored chicken BBQ whole', 403.0],
  ['Lumpiang Shanghai 10 pcs', 196.0],
  ['Lumpiang Shanghai 10 pcs', 196.0],
  ['Crispy Pata Medium', 805.0],
  ['Crispy Pata Large', 920.0],
  ['Bihon Bilao Large', 1438.0],
  ['Bihon Bilao Medium', 920.0],
  ['Bihon Bilao Small', 575.0],
  ['Lumpia Shanghai Large Bilao', 1553.0],
  ['Lumpia Shanghai Medium Bilao', 1070.0],
  ['Lumpia Shanghai Small Bilao', 552.0],
  ['Tofu Sisig', 138.0],
  ['Lechon Kawali', 265.0],
  ['Chopsuey Con Lechon', 236.0],
  ['Lomi Con Lechon', 213.0],
  ['Sinigang con Lechon', 230.0],
  ['Kasalo Pork Sisig', 150.0],
  ['Barkada Sisig', 299.0],
  ['Lomi', 201.0],
  ['Bihon Con Lechon', 213.0],
  ['Budbod Tapa', 127.0],
  ['Chonjalog', 114.0],
  ['Sisigjalog', 114.0],
  ['Lumpiajalog', 115.0],
  ['Canton con lechon', 230.0],
  ['Longjalog', 109.0],
  ['Chixjalog', 138.0],
  ['Tapjalog', 114.0],
  ['Roasted Chicken ( Half )', 201.0],
  ['Roasted Chicken ( whole )', 355.0],
];

// Category assignment by product name (matched against the product-categories
// collection so the category id is always resolved at runtime).
const CATEGORY_BY_PRODUCT = {
  'Flavored Chicken Roasted ( Half )': 'Main Courses',
  'Flavored Chicken roasted Whole': 'Main Courses',
  'Flavored Chicken BBQ half': 'BBQ',
  'Flavored chicken BBQ whole': 'BBQ',
  'Lumpiang Shanghai 10 pcs': 'Appetizer',
  'Crispy Pata Medium': 'Main Courses',
  'Crispy Pata Large': 'Main Courses',
  'Bihon Bilao Large': 'Party Trays',
  'Bihon Bilao Medium': 'Party Trays',
  'Bihon Bilao Small': 'Party Trays',
  'Lumpia Shanghai Large Bilao': 'Party Trays',
  'Lumpia Shanghai Medium Bilao': 'Party Trays',
  'Lumpia Shanghai Small Bilao': 'Party Trays',
  'Tofu Sisig': 'Main Courses',
  'Lechon Kawali': 'Main Courses',
  'Chopsuey Con Lechon': 'Main Courses',
  'Lomi Con Lechon': 'Main Courses',
  'Sinigang con Lechon': 'Main Courses',
  'Kasalo Pork Sisig': 'Main Courses',
  'Barkada Sisig': 'Main Courses',
  'Lomi': 'Main Courses',
  'Bihon Con Lechon': 'Main Courses',
  'Budbod Tapa': 'Rice Meals',
  'Chonjalog': 'Rice Meals',
  'Sisigjalog': 'Rice Meals',
  'Lumpiajalog': 'Rice Meals',
  'Canton con lechon': 'Main Courses',
  'Longjalog': 'Rice Meals',
  'Chixjalog': 'Rice Meals',
  'Tapjalog': 'Rice Meals',
  'Roasted Chicken ( Half )': 'Main Courses',
  'Roasted Chicken ( whole )': 'Main Courses',
};

function slugify(name) {
  return name
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[/]+/g, '-')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/[\s-]+/g, '-');
}

function skuify(name, id) {
  const base = name
    .toUpperCase()
    .replace(/[/]+/g, '-')
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `${base}-${id}`;
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

async function main() {
  if (!API_KEY) {
    console.error('PAYLOAD_API_KEY is not set. Cannot authenticate with the CMS.');
    process.exit(1);
  }
  if (DRY_RUN) {
    console.log('DRY RUN MODE - no changes will be written.\n');
  }

  // Load categories so we can resolve category ids by name.
  const catData = await api('GET', '/product-categories?limit=1000&depth=0');
  const categories = catData?.docs || [];
  const catIdByName = new Map(categories.map((c) => [c.name, c.id]));
  console.log(`Loaded ${categories.length} product categories.\n`);

  let createdProducts = 0;
  let createdMerchantProducts = 0;
  let skippedProducts = 0;

  for (const [name, price] of PRODUCTS) {
    const slug = slugify(name);
    const categoryName = CATEGORY_BY_PRODUCT[name];
    const categoryId = categoryName ? catIdByName.get(categoryName) : undefined;

    console.log('========================================');
    console.log(`Product : ${name}`);
    console.log(`Price   : ₱ ${price.toFixed(2)}`);
    console.log(`Slug    : ${slug}`);
    console.log(`Category: ${categoryName} (id ${categoryId ?? 'NOT FOUND'})`);

    if (!categoryId) {
      console.error(`  !! Cannot find category "${categoryName}". Skipping product.\n`);
      continue;
    }

    // Check for an existing product owned by this vendor with the same name.
    let existing = null;
    try {
      const search = await api(
        'GET',
        `/products?where[createdByVendor][equals]=${VENDOR_ID}&where[name][equals]=${encodeURIComponent(name)}&limit=1&depth=0`
      );
      existing = search?.docs?.[0] || null;
    } catch (e) {
      console.error(`  !! Lookup failed: ${e.message}`);
    }

    let productId;

    if (existing) {
      productId = existing.id;
      skippedProducts++;
      console.log(`  -> Product already exists (id ${productId}). Skipping create.`);
    } else {
      if (DRY_RUN) {
        console.log('  [dry-run] Would create product (sku needs id after creation).');
        productId = null;
      } else {
        const createData = await api('POST', '/products', {
          createdByVendor: VENDOR_ID,
          productType: 'simple',
          name,
          slug,
          categories: [categoryId],
          basePrice: price,
          assign_to_all_vendor_merchants: false,
        });
        productId = createData?.doc?.id;
        console.log(`  -> Created product (id ${productId}).`);
        createdProducts++;

        // SKU is derived from name + product id (all uppercase).
        const sku = skuify(name, productId);
        await api('PATCH', `/products/${productId}`, { sku });
        console.log(`  -> Set SKU: ${sku}`);
      }
    }

    if (!productId) {
      continue;
    }

    // Create the Merchant Product link.
    if (DRY_RUN) {
      console.log(`  [dry-run] Would create merchant-product (merchant ${MERCHANT_ID} -> product ${productId}, added_by vendor).`);
      continue;
    }

    try {
      const mpSearch = await api(
        'GET',
        `/merchant-products?where[merchant_id][equals]=${MERCHANT_ID}&where[product_id][equals]=${productId}&limit=1&depth=0`
      );
      if (mpSearch?.docs?.length) {
        console.log(`  -> Merchant-product already exists (id ${mpSearch.docs[0].id}).`);
      } else {
        const mp = await api('POST', '/merchant-products', {
          merchant_id: MERCHANT_ID,
          product_id: productId,
          added_by: 'vendor',
        });
        console.log(`  -> Created merchant-product (id ${mp?.doc?.id}).`);
        createdMerchantProducts++;
      }
    } catch (e) {
      console.error(`  !! Merchant-product creation failed: ${e.message}`);
    }
  }

  console.log('\n========================================');
  if (DRY_RUN) {
    console.log(`DRY RUN complete. ${PRODUCTS.length} products in the list.`);
  } else {
    console.log(`Done. Created ${createdProducts} products and ${createdMerchantProducts} merchant-products (${skippedProducts} already existed).`);
  }
}

main().catch((e) => {
  console.error('Fatal error:', e);
  process.exit(1);
});