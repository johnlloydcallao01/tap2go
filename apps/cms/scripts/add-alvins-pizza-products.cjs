/**
 * Add products for ALVIN'S PIZZA to the CMS.
 *
 * For each product in the list below this script:
 *  1. Creates a Product in the `products` collection:
 *     - createdByVendor = 2 (ALVIN'S PIZZA)
 *     - productType = 'simple' (Simple Product)
 *     - name, slug (derived from name), categories (pizzas -> "Pizza",
 *       toppings/add-ons -> "Addons"), basePrice, sku (name + product id, uppercased)
 *  2. Creates a Merchant Product in the `merchant-products` collection:
 *     - merchant_id = 7 (ALVIN'S PIZZA)
 *     - product_id = the product created above
 *     - added_by = 'vendor'
 *
 * Usage:
 *   node scripts/add-alvins-pizza-products.cjs            # perform the insertion
 *   node scripts/add-alvins-pizza-products.cjs --dry-run  # print plan only
 *
 * The script is idempotent: products already owned by vendor 2 with the same
 * name are skipped (and their merchant product is created if missing).
 */
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const API_URL = process.env.PAYLOAD_API_URL || 'https://cms.tap2goph.com/api';
const API_KEY = process.env.PAYLOAD_API_KEY;

const VENDOR_ID = 2; // ALVIN'S PIZZA
const MERCHANT_ID = 7; // ALVIN'S PIZZA

const DRY_RUN = process.argv.includes('--dry-run');

// Product list: [name, price in PHP]
const PRODUCTS = [
  ['Bacon Plus 2 toppings', 174.0],
  ['Bacon & Mushroom Toppings Pizza', 163.0],
  ['Bacon & Onion Toppings Pizza', 163.0],
  ['Bacon & Beef Toppings Pizza', 163.0],
  ['Bacon & Pineapple Toppings Pizza', 163.0],
  ['Bacon & Garlic Toppings Pizza', 163.0],
  ['Bacon & Pepperoni Toppings Pizza', 163.0],
  ['Bacon & Cheese Toppings Pizza', 163.0],
  ['Bacon & Ham Toppings Pizza', 163.0],
  ['14 inches Regular Pizza', 295.0],
  ['14 inches Bacon Special Pizza', 325.0],
  ['14 inches Super Special Pizza', 328.0],
  ['Bacon Special 10 inches Pizza', 174.0],
  ['Bacon Regular 10 inches Pizza', 163.0],
  ['Bacon Super Special 10 inches Pizza', 196.0],
  ['Ham', 30.0],
  ['Beef', 30.0],
  ['Pepperoni', 30.0],
  ['Pineapple', 30.0],
  ['Mushroom', 30.0],
  ['Onion', 30.0],
  ['Bell Pepper', 30.0],
  ['Cheddar Cubes (Option)', 30.0],
  ['Bacon (Special)', 35.0],
  ['Melted Cheese (Add Ons)', 42.0],
  ['Mozzarella (Add Ons)', 43.0],
  ['Parmesan (Add Ons)', 50.0],
  ['14 Inches Pizza ( Bacon Regular )', 306.0],
  ['14 Inches Pizza ( Bacon Super Special )', 329.0],
  ['14 Inches Pizza (Special)', 317.0],
  ['Special 10 Inches Pizza', 163.0],
  ['Super Special 10 inches Pizza', 185.0],
  ['REGULAR 10 INCHES PIZZA (BEST SELLER)', 141.0],
  ['Regular 10 inches Pizza Ham & Pepperoni', 141.0],
  ['Regular 10 inches Pizza Mushroom & Pepperoni', 141.0],
  ['Regular 10 inches Pizza Beef & Ham', 141.0],
  ['Regular 10 inches Pizza Pineapple & Mushroom', 141.0],
  ['Regular 10 iches Pizza Mushroom & Onion', 141.0],
  ['Regular 10 inches Pizza Pineapple & Pepperoni', 141.0],
  ['Regular 10 inches Pizza Pepperoni & cheese', 141.0],
  ['Regular 10 inches Pizza Beef & Cheese', 141.0],
  ['Regular 10 inches Pizza Beef & Pepperoni', 141.0],
  ['Regular 10 inches Pizza Ham & Mushroom', 141.0],
  ['Regular 10 inches Pizza Beef & onion', 141.0],
  ['Regular 10 inches Pizza Beef & Pepper', 141.0],
  ['Regular 10 inches Pizza Beef & Pineapple', 141.0],
  ['Regular 10 inches Pizza Pepperoni', 141.0],
  ['Regular 10 inches Pizza Ham & cheese', 141.0],
  ['Regular 10 inches Pizza Beef & Mushroom', 141.0],
  ['Regular Pizza Hawaiian Delight', 141.0],
];

// Pizzas (and the "Bacon Plus 2 toppings" combo) go under "Pizza"; individual
// toppings / add-ons under "Addons". Both resolved to ids at runtime against
// the product-categories collection.
const CATEGORY_PIZZA = 'Pizza';
const CATEGORY_ADDONS = 'Addons';

function categoryFor(name) {
  const lower = name.toLowerCase();
  return lower.includes('pizza') || name === 'Bacon Plus 2 toppings' ? CATEGORY_PIZZA : CATEGORY_ADDONS;
}

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
  const pizzaCatId = catIdByName.get(CATEGORY_PIZZA);
  const addonsCatId = catIdByName.get(CATEGORY_ADDONS);
  console.log(`Loaded ${categories.length} product categories.`);
  console.log(`Category "${CATEGORY_PIZZA}" -> id ${pizzaCatId ?? 'NOT FOUND'}`);
  console.log(`Category "${CATEGORY_ADDONS}" -> id ${addonsCatId ?? 'NOT FOUND'}\n`);

  if (!pizzaCatId || !addonsCatId) {
    console.error('!! Missing required category. Aborting.');
    process.exit(1);
  }

  let createdProducts = 0;
  let createdMerchantProducts = 0;
  let skippedProducts = 0;

  for (const [name, price] of PRODUCTS) {
    const slug = slugify(name);
    const categoryName = categoryFor(name);
    const categoryId = categoryName === CATEGORY_PIZZA ? pizzaCatId : addonsCatId;

    console.log('========================================');
    console.log(`Product : ${name}`);
    console.log(`Price   : ₱ ${price.toFixed(2)}`);
    console.log(`Slug    : ${slug}`);
    console.log(`Category: ${categoryName} (id ${categoryId})`);

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