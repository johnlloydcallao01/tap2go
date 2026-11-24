/**
 * Remove GMK CAFES's remaining vendor-owned products, merchant, and vendor.
 * The vendor's associated user account is intentionally preserved.
 *
 * Usage:
 *   node scripts/remove-gmk-cafes-merchant-vendor.cjs
 *   node scripts/remove-gmk-cafes-merchant-vendor.cjs --apply
 */
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const API_URL = process.env.PAYLOAD_API_URL || 'https://cms.tap2goph.com/api';
const API_KEY = process.env.PAYLOAD_API_KEY;
const MERCHANT_ID = 25;
const MERCHANT_NAME = 'GMK CAFEs';
const VENDOR_ID = 20;
const VENDOR_NAME = 'GMK CAFE';
const EXPECTED_PRODUCT_COUNT = 75;
const APPLY = process.argv.includes('--apply');

function relationId(value) {
  if (value && typeof value === 'object') return Number(value.id);
  return Number(value);
}

async function api(method, endpoint) {
  const res = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `users API-Key ${API_KEY}`,
    },
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

async function findDocs(collection, filters, limit = 1000) {
  const query = filters
    .map(([field, value]) => `where[${field}][equals]=${encodeURIComponent(String(value))}`)
    .join('&');
  const result = await api('GET', `/${collection}?${query}&limit=${limit}&depth=1`);
  if ((result?.totalDocs ?? result?.docs?.length ?? 0) > (result?.docs?.length ?? 0)) {
    throw new Error(`Query for ${collection} returned truncated results; refusing cleanup.`);
  }
  return result?.docs || [];
}

async function findByIds(collection, field, ids) {
  const docs = [];
  for (let index = 0; index < ids.length; index += 100) {
    const batch = ids.slice(index, index + 100).join(',');
    const result = await api(
      'GET',
      `/${collection}?where[${field}][in]=${encodeURIComponent(batch)}&limit=1000&depth=1`
    );
    if ((result?.totalDocs ?? result?.docs?.length ?? 0) > (result?.docs?.length ?? 0)) {
      throw new Error(`Reference query for ${collection} was truncated; refusing cleanup.`);
    }
    docs.push(...(result?.docs || []));
  }
  return docs;
}

async function countReferences(collection, filters) {
  return findDocs(collection, filters);
}

async function main() {
  if (!API_KEY) throw new Error('PAYLOAD_API_KEY is not set. Cannot authenticate with the CMS.');
  if (!APPLY) console.log('DRY RUN MODE - no changes will be written.\n');

  const merchant = await api('GET', `/merchants/${MERCHANT_ID}?depth=0`);
  const vendor = await api('GET', `/vendors/${VENDOR_ID}?depth=0`);
  if (merchant.outletName !== MERCHANT_NAME || relationId(merchant.vendor) !== VENDOR_ID) {
    throw new Error(`Merchant ${MERCHANT_ID} is not the expected ${MERCHANT_NAME} outlet owned by vendor ${VENDOR_ID}.`);
  }
  if (vendor.businessName !== VENDOR_NAME) {
    throw new Error(`Vendor ${VENDOR_ID} is "${vendor.businessName}", not the expected ${VENDOR_NAME}.`);
  }

  const vendorMerchants = await findDocs('merchants', [['vendor', VENDOR_ID]]);
  if (vendorMerchants.length !== 1 || Number(vendorMerchants[0].id) !== MERCHANT_ID) {
    throw new Error(
      `Vendor ${VENDOR_ID} has ${vendorMerchants.length} merchant locations, not only GMK CAFEs; refusing deletion.`
    );
  }

  const products = await findDocs('products', [['createdByVendor', VENDOR_ID]]);
  if (products.length !== EXPECTED_PRODUCT_COUNT) {
    throw new Error(
      `Expected ${EXPECTED_PRODUCT_COUNT} remaining vendor products but found ${products.length}; refusing unexpected-scope deletion.`
    );
  }
  if (products.some((product) => product.productType !== 'simple')) {
    throw new Error('Vendor catalog now contains non-simple products; refusing deletion.');
  }
  const productIds = products.map((product) => Number(product.id));

  const [merchantLinks, productLinks, productCarts, productOrderItems] = await Promise.all([
    findDocs('merchant-products', [['merchant_id', MERCHANT_ID]]),
    findByIds('merchant-products', 'product_id', productIds),
    findByIds('cart-items', 'product', productIds),
    findByIds('order-items', 'product', productIds),
  ]);
  if (merchantLinks.length !== EXPECTED_PRODUCT_COUNT) {
    throw new Error(
      `Expected ${EXPECTED_PRODUCT_COUNT} GMK merchant-product links but found ${merchantLinks.length}; refusing cleanup.`
    );
  }
  const productIdSet = new Set(productIds);
  const linkedProductIds = new Set(merchantLinks.map((link) => relationId(link.product_id)));
  if (productIds.some((id) => !linkedProductIds.has(id))) {
    throw new Error('One or more vendor products are not linked to GMK CAFES; refusing cleanup.');
  }
  if (productLinks.some((link) => relationId(link.merchant_id) !== MERCHANT_ID)) {
    throw new Error('One or more products are linked to another merchant; refusing global product deletion.');
  }
  if (productCarts.length || productOrderItems.length) {
    throw new Error(
      `Vendor products have ${productCarts.length} cart and ${productOrderItems.length} order-item references; refusing cleanup.`
    );
  }

  const merchantProductIds = merchantLinks.map((link) => Number(link.id));
  const [merchantOrders, merchantCarts, reviews, recentViews, wishlists, merchantTags, vendorTags, vendorCoupons, coupons] =
    await Promise.all([
      countReferences('orders', [['merchant', MERCHANT_ID]]),
      countReferences('cart-items', [['merchant', MERCHANT_ID]]),
      countReferences('reviews', [['merchant', MERCHANT_ID]]),
      countReferences('recent-views', [['merchant', MERCHANT_ID]]),
      countReferences('wishlists', [['merchant', MERCHANT_ID]]),
      countReferences('prod-tags-junction', [['added_by_merchant_id', MERCHANT_ID]]),
      countReferences('prod-tags-junction', [['added_by_vendor_id', VENDOR_ID]]),
      countReferences('coupons', [['vendor', VENDOR_ID]]),
      api('GET', '/coupons?limit=1000&depth=0'),
    ]);

  if ((coupons?.totalDocs ?? coupons?.docs?.length ?? 0) > (coupons?.docs?.length ?? 0)) {
    throw new Error('Coupon query returned truncated results; refusing cleanup.');
  }
  const merchantCoupons = (coupons?.docs || []).filter((coupon) =>
    (Array.isArray(coupon.merchants) ? coupon.merchants : []).some(
      (couponMerchant) => relationId(couponMerchant) === MERCHANT_ID
    )
  );
  const productRecentViews = await findByIds('recent-views', 'merchantProduct', merchantProductIds);
  const productWishlists = await findByIds('wishlists', 'merchantProduct', merchantProductIds);
  const productCoupons = (coupons?.docs || []).filter((coupon) => {
    const included = Array.isArray(coupon.menu_items) ? coupon.menu_items : [];
    const excluded = Array.isArray(coupon.excluded_menu_items) ? coupon.excluded_menu_items : [];
    return [...included, ...excluded].some((product) => productIdSet.has(relationId(product)));
  });

  const referenceCounts = {
    merchantOrders: merchantOrders.length,
    merchantCarts: merchantCarts.length,
    productCartItems: productCarts.length,
    productOrderItems: productOrderItems.length,
    reviews: reviews.length,
    recentViews: recentViews.length + productRecentViews.length,
    wishlists: wishlists.length + productWishlists.length,
    merchantTagLinks: merchantTags.length,
    vendorTagLinks: vendorTags.length,
    vendorCoupons: vendorCoupons.length,
    merchantCoupons: merchantCoupons.length,
    productCoupons: productCoupons.length,
  };
  const nonZeroReferences = Object.entries(referenceCounts).filter(([, count]) => count > 0);
  if (nonZeroReferences.length) {
    throw new Error(
      `Deletion is blocked by related records: ${nonZeroReferences.map(([name, count]) => `${name}=${count}`).join(', ')}.`
    );
  }

  console.log(`Verified ${products.length} remaining vendor-owned products and ${merchantLinks.length} merchant links.`);
  console.log('No other merchant links or cart, order, review, view, wishlist, coupon, or tag references found.');
  console.log(`Vendor user account ${relationId(vendor.user)} will be preserved.`);

  if (!APPLY) {
    console.log('\nDRY RUN complete. Re-run with --apply to delete these products, the merchant, and the vendor.');
    return;
  }

  for (const product of products) {
    await api('DELETE', `/products/${product.id}`);
    console.log(`Deleted product "${product.name}" (id ${product.id}).`);
  }
  const remainingProducts = await findDocs('products', [['createdByVendor', VENDOR_ID]]);
  if (remainingProducts.length) {
    throw new Error(`Product cleanup incomplete: ${remainingProducts.length} vendor products remain.`);
  }

  await api('DELETE', `/merchants/${MERCHANT_ID}`);
  console.log(`Deleted merchant "${MERCHANT_NAME}" (id ${MERCHANT_ID}).`);

  const remainingMerchants = await findDocs('merchants', [['vendor', VENDOR_ID]]);
  if (remainingMerchants.length) {
    throw new Error(`Merchant cleanup incomplete: ${remainingMerchants.length} vendor merchants remain.`);
  }

  await api('DELETE', `/vendors/${VENDOR_ID}`);
  console.log(`Deleted vendor "${VENDOR_NAME}" (id ${VENDOR_ID}).`);
  console.log(`Vendor user account ${relationId(vendor.user)} was preserved.`);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exitCode = 1;
});
