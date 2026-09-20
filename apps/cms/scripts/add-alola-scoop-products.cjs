/**
 * Add products for ALOLA SCOOP to the CMS.
 *
 * For each product in the list below this script:
 *  1. Creates a Product in the `products` collection:
 *     - createdByVendor = 30 (ALOLA SCOOP)
 *     - productType = 'simple' (Simple Product)
 *     - name, slug (derived from name), categories (matched by name -> Dessert),
 *       basePrice (from the price column), sku (name + product id, uppercased)
 *  2. Creates a Merchant Product in the `merchant-products` collection:
 *     - merchant_id = 28 (ALOLA SCOOP)
 *     - product_id = the product created above
 *     - added_by = 'vendor'
 *
 * Usage:
 *   node scripts/add-alola-scoop-products.cjs            # perform the insertion
 *   node scripts/add-alola-scoop-products.cjs --dry-run  # print plan only
 *
 * The script is idempotent: products already owned by vendor 30 with the same
 * name are skipped (and their merchant product is created if missing).
 */
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const API_URL = process.env.PAYLOAD_API_URL || 'https://cms.tap2goph.com/api';
const API_KEY = process.env.PAYLOAD_API_KEY;

const VENDOR_ID = 30; // ALOLA SCOOP
const MERCHANT_ID = 28; // ALOLA SCOOP

const DRY_RUN = process.argv.includes('--dry-run');

// Product list: [name, price in PHP]
const PRODUCTS = [
  ['Mango Graham Premium', 288.0],
  ['Black Forest Signature', 357.0],
  ['Dark Revel Oats Signature', 357.0],
  ['White Chocolate Premium', 311.0],
  ['Stone Cold 3:16 Premium', 311.0],
  ['Very Berry Strawberry Premium', 311.0],
  ['Cookies & Cream Premium', 311.0],
  ['Java Chips Premium', 311.0],
  ['Pnut-Buttah Cream Premium', 311.0],
  ['Mango Classic', 253.0],
  ['French Vanilla Crunch Classic', 253.0],
  ['Coffee Mallows Classic', 253.0],
  ['Spanish Latte Classic', 253.0],
  ['Twilight Crunch Classic', 253.0],
  ['Matcha-love Classic', 253.0],
  ['Chocolate classic', 253.0],
  ['Quesoyum Classic', 253.0],
  ['Ube Halayeah', 253.0],
  ['Moca cake classic', 229.0],
];

// All Alola Scoop items are ice cream / dessert so the "Dessert" category is
// used for every product (resolved to its id at runtime against the
// product-categories collection).
const CATEGORY_NAME = 'Dessert';

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
  const categoryId = catIdByName.get(CATEGORY_NAME);
  console.log(`Loaded ${categories.length} product categories.`);
  console.log(`Category "${CATEGORY_NAME}" -> id ${categoryId ?? 'NOT FOUND'}\n`);

  if (!categoryId) {
    console.error(`!! Cannot find category "${CATEGORY_NAME}". Aborting.`);
    process.exit(1);
  }

  let createdProducts = 0;
  let createdMerchantProducts = 0;
  let skippedProducts = 0;

  for (const [name, price] of PRODUCTS) {
    const slug = slugify(name);

    console.log('========================================');
    console.log(`Product : ${name}`);
    console.log(`Price   : ₱ ${price.toFixed(2)}`);
    console.log(`Slug    : ${slug}`);
    console.log(`Category: ${CATEGORY_NAME} (id ${categoryId})`);

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