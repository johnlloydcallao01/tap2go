/**
 * Add products for LUKAS BUTTER STEAKS to the CMS.
 *
 * Creates vendor-owned simple products and assigns each to a product category,
 * then ensures each product is linked to merchant 31.
 *
 * Usage:
 *   node scripts/add-lukas-butter-steaks-products.cjs            # perform the insertion
 *   node scripts/add-lukas-butter-steaks-products.cjs --dry-run  # print plan only
 */
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const API_URL = process.env.PAYLOAD_API_URL || 'https://cms.tap2goph.com/api';
const API_KEY = process.env.PAYLOAD_API_KEY;

const VENDOR_ID = 31; // LUKAS BUTTER STEAKS
const MERCHANT_ID = 31; // LUKAS BUTTER STEAKS

const DRY_RUN = process.argv.includes('--dry-run');

// Product list: [name, category, price in PHP]
const PRODUCTS = [
  ['Porterhouse Beef Steak, 4 slices, 1kg', 'Main Courses', 1359.0],
  ['Porterhouse Beef Steak, 4 slices, 490g', 'Main Courses', 759.0],
  ['Porterhouse Beef Steak, 3 slices, 320g', 'Main Courses', 506.0],
  ['Porterhouse Beef Steak, 4 slices, 240g', 'Main Courses', 385.0],
  ['T-Bone Beef Steak, 4 slices, 240g', 'Main Courses', 369.0],
  ['T-Bone Beef Steak, 3 slices, 320g', 'Main Courses', 484.0],
  ['T-Bone Beef Steak, 2 slices, 490g', 'Main Courses', 743.0],
  ['Rib Eye Beef Steak, 5 slices, 190–200g', 'Main Courses', 319.0],
  ['Rib Eye Beef Steak, 4 slices, 240–250g', 'Main Courses', 539.0],
  ['Rib Eye Beef Steak, 3 slices, 320–333g', 'Main Courses', 715.0],
  ['Rib Eye Beef Steak, 2 slices, 490–500g', 'Main Courses', 1067.0],
  ['Hungarian Sausage', 'BBQ', 350.0],
  ['Burger Patty 500g', 'Burger', 350.0],
  ['Saikoro Wagyu 300g', 'Main Courses', 495.0],
  ['Saikoro Wagyu 1kg', 'Main Courses', 1375.0],
  ['NK Wagyu 250g', 'Main Courses', 523.0],
  ['NK Wagyu 1kg', 'Main Courses', 1903.0],
  ["Luka's Wagyu 500g", 'Main Courses', 660.0],
  ['Beef Sukiyaki 500g', 'Main Courses', 484.0],
  ['Beef Samgyupsal 500g', 'BBQ', 484.0],
  ['Black Truffle', 'Pasta', 495.0],
  ['Spice Arrabiata', 'Pasta', 352.0],
  ['Garlic Lovers', 'Pasta', 352.0],
  ['Classic Carbonara', 'Pasta', 352.0],
  ['Meaty Bolognese', 'Pasta', 352.0],
];

function slugify(name) {
  return name
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\u2010-\u2015\u2212]/g, '-')
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
    throw new Error('PAYLOAD_API_KEY is not set. Cannot authenticate with the CMS.');
  }
  if (DRY_RUN) {
    console.log('DRY RUN MODE - no changes will be written.\n');
  }

  const catData = await api('GET', '/product-categories?limit=1000&depth=0');
  const categories = catData?.docs || [];
  const catIdByName = new Map(categories.map((category) => [category.name, category.id]));
  const requiredCategories = [...new Set(PRODUCTS.map(([, categoryName]) => categoryName))];
  const missingCategories = requiredCategories.filter((name) => !catIdByName.has(name));

  if (missingCategories.length > 0) {
    throw new Error(`Cannot find required product categories: ${missingCategories.join(', ')}`);
  }
  console.log(`Loaded ${categories.length} product categories.\n`);

  let createdProducts = 0;
  let createdMerchantProducts = 0;
  let skippedProducts = 0;

  for (const [name, categoryName, price] of PRODUCTS) {
    const slug = slugify(name);
    const categoryId = catIdByName.get(categoryName);

    console.log('========================================');
    console.log(`Product : ${name}`);
    console.log(`Price   : ₱ ${price.toFixed(2)}`);
    console.log(`Slug    : ${slug}`);
    console.log(`Category: ${categoryName} (id ${categoryId})`);

    const search = await api(
      'GET',
      `/products?where[createdByVendor][equals]=${VENDOR_ID}&where[name][equals]=${encodeURIComponent(name)}&limit=1&depth=0`
    );
    const existing = search?.docs?.[0] || null;

    let productId;

    if (existing) {
      productId = existing.id;
      skippedProducts++;
      console.log(`  -> Product already exists (id ${productId}). Skipping create.`);
    } else if (DRY_RUN) {
      console.log('  [dry-run] Would create product and set its SKU.');
      console.log(`  [dry-run] Would create merchant-product (merchant ${MERCHANT_ID} -> new product, added_by vendor).`);
      continue;
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
      if (!productId) {
        throw new Error(`Product creation returned no ID for "${name}".`);
      }

      console.log(`  -> Created product (id ${productId}).`);
      createdProducts++;

      const sku = skuify(name, productId);
      await api('PATCH', `/products/${productId}`, { sku });
      console.log(`  -> Set SKU: ${sku}`);
    }

    const mpSearch = await api(
      'GET',
      `/merchant-products?where[merchant_id][equals]=${MERCHANT_ID}&where[product_id][equals]=${productId}&limit=1&depth=0`
    );
    if (mpSearch?.docs?.length) {
      console.log(`  -> Merchant-product already exists (id ${mpSearch.docs[0].id}).`);
    } else if (DRY_RUN) {
      console.log(`  [dry-run] Would create merchant-product (merchant ${MERCHANT_ID} -> product ${productId}, added_by vendor).`);
    } else {
      const mp = await api('POST', '/merchant-products', {
        merchant_id: MERCHANT_ID,
        product_id: productId,
        added_by: 'vendor',
      });
      console.log(`  -> Created merchant-product (id ${mp?.doc?.id}).`);
      createdMerchantProducts++;
    }
  }

  console.log('\n========================================');
  if (DRY_RUN) {
    console.log(`DRY RUN complete. Checked ${PRODUCTS.length} products; no changes were written.`);
  } else {
    console.log(`Done. Created ${createdProducts} products and ${createdMerchantProducts} merchant-products (${skippedProducts} already existed).`);
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
