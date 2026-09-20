/**
 * Add products for D' MEAT HAUS to the CMS.
 *
 * For each product in the list below this script:
 *  1. Creates a Product in the `products` collection:
 *     - createdByVendor = 29 (D' MEAT HAUS)
 *     - productType = 'simple' (Simple Product)
 *     - name, slug (derived from name), categories (matched by name),
 *       basePrice (from the price column), sku (name + product id, uppercased)
 *  2. Creates a Merchant Product in the `merchant-products` collection:
 *     - merchant_id = 29 (D' MEAT HAUS)
 *     - product_id = the product created above
 *     - added_by = 'vendor'
 *
 * Usage:
 *   node scripts/add-dmeathaus-products.cjs            # perform the insertion
 *   node scripts/add-dmeathaus-products.cjs --dry-run  # print plan only
 *
 * The script is idempotent: products already owned by vendor 29 with the same
 * name are skipped (and their merchant product is created if missing).
 */
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const API_URL = process.env.PAYLOAD_API_URL || 'https://cms.tap2goph.com/api';
const API_KEY = process.env.PAYLOAD_API_KEY;

const VENDOR_ID = 29; // D' MEAT HAUS
const MERCHANT_ID = 29; // D' MEAT HAUS

const DRY_RUN = process.argv.includes('--dry-run');

// Product list: [name, price in PHP]
const PRODUCTS = [
  ['Beef Cheese Rice Topping', 437.0],
  ['Beef Cabbage Rice Topping', 437.0],
  ['Beef Enoki rice Topping', 437.0],
  ['Beef Kungmahol Rice Topping', 437.0],
  ['Pork Belly Enoki Rice Topping', 403.0],
  ['Pork Belly Kungnamol Rice topping', 403.0],
  ['Pork Belly Cheese Rice Topping', 403.0],
  ['Pork Belly Cabbage Rice Topping', 403.0],
  ['Spicy Pork Bibimbap', 368.0],
  ['Crazy Crab Roll', 322.0],
  ['Cheese Kimbap', 299.0],
  ['Beef Kimbap', 334.0],
  ['Original Kimbap', 276.0],
  ['Aged Pork Moksal', 587.0],
  ['Korean Fried chicken', 564.0],
  ['Aged Pork Belly', 598.0],
  ['Pork Tripe', 564.0],
  ['Kimchi Jjigae', 403.0],
  ['Sundubu Jjigae', 403.0],
  ['Budae Jjigae', 943.0],
  ['Doenjang Jjigae', 414.0],
  ['Odeng Tang', 414.0],
  ['Pork Enoki roll', 357.0],
  ['Beef woosamgyupsal', 345.0],
  ['Pork Samgyupsal', 322.0],
  ['Pre-Grilled aged Moksal', 886.0],
  ['Beef Enoki Roll', 368.0],
  ['Pre-Grilled Aged Pork Belly', 909.0],
  ['Cheese Topokki', 426.0],
  ['Rose topokki', 403.0],
  ['Cucumber Salad', 196.0],
  ['Cheese Egg Soup', 322.0],
  ['Cheese Egg Roll', 368.0],
  ['Braised Tofu', 196.0],
  ['Deep Fried Mandoo', 350.0],
  ['Fish cake 150 grams', 230.0],
  ['Japchae 450 grams', 459.0],
  ['Kimchi Pajeon', 207.0],
  ['Egg Roll', 276.0],
  ['Pajori Salad', 478.0],
  ['Radish Salad', 196.0],
  ['Seafood Pajeon', 564.0],
  ['Steamed egg', 265.0],
  ['Sweet Popato', 173.0],
  ['Extra Rice', 69.0],
  ['Pineapple Juice in can', 104.0],
  ['Sprite 1.5 Liter', 161.0],
  ['Coke Original 1.5 Liter', 161.0],
  ['Coke Zero 1.5 Liter', 161.0],
  ['Coke zero in can', 115.0],
];

// Category assignment by product name (matched against the product-categories
// collection so the category id is always resolved at runtime).
const CATEGORY_BY_PRODUCT = {
  'Beef Cheese Rice Topping': 'Rice Meals',
  'Beef Cabbage Rice Topping': 'Rice Meals',
  'Beef Enoki rice Topping': 'Rice Meals',
  'Beef Kungmahol Rice Topping': 'Rice Meals',
  'Pork Belly Enoki Rice Topping': 'Rice Meals',
  'Pork Belly Kungnamol Rice topping': 'Rice Meals',
  'Pork Belly Cheese Rice Topping': 'Rice Meals',
  'Pork Belly Cabbage Rice Topping': 'Rice Meals',
  'Spicy Pork Bibimbap': 'Bibimbap',
  'Crazy Crab Roll': 'Gimbap',
  'Cheese Kimbap': 'Gimbap',
  'Beef Kimbap': 'Gimbap',
  'Original Kimbap': 'Gimbap',
  'Aged Pork Moksal': 'BBQ',
  'Korean Fried chicken': 'Fried Chicken',
  'Aged Pork Belly': 'BBQ',
  'Pork Tripe': 'BBQ',
  'Kimchi Jjigae': 'Main Courses',
  'Sundubu Jjigae': 'Main Courses',
  'Budae Jjigae': 'Main Courses',
  'Doenjang Jjigae': 'Main Courses',
  'Odeng Tang': 'Main Courses',
  'Pork Enoki roll': 'BBQ',
  'Beef woosamgyupsal': 'BBQ',
  'Pork Samgyupsal': 'BBQ',
  'Pre-Grilled aged Moksal': 'BBQ',
  'Beef Enoki Roll': 'BBQ',
  'Pre-Grilled Aged Pork Belly': 'BBQ',
  'Cheese Topokki': 'Snacks',
  'Rose topokki': 'Snacks',
  'Cucumber Salad': 'Salad',
  'Cheese Egg Soup': 'Sides',
  'Cheese Egg Roll': 'Sides',
  'Braised Tofu': 'Sides',
  'Deep Fried Mandoo': 'Appetizer',
  'Fish cake 150 grams': 'Sides',
  'Japchae 450 grams': 'Party Trays',
  'Kimchi Pajeon': 'Appetizer',
  'Egg Roll': 'Sides',
  'Pajori Salad': 'Salad',
  'Radish Salad': 'Salad',
  'Seafood Pajeon': 'Appetizer',
  'Steamed egg': 'Sides',
  'Sweet Popato': 'Sides',
  'Extra Rice': 'Addons',
  'Pineapple Juice in can': 'Beverages',
  'Sprite 1.5 Liter': 'Softdrinks',
  'Coke Original 1.5 Liter': 'Softdrinks',
  'Coke Zero 1.5 Liter': 'Softdrinks',
  'Coke zero in can': 'Softdrinks',
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