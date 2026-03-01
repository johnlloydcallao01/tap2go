import { apiConfig } from '../config/environment';
import { Product, ModifierGroup, ModifierOption } from '../types/product';

const API_BASE = apiConfig.baseUrl;
const API_KEY = apiConfig.payloadApiKey;

function buildHeaders(): Record<string, string> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (API_KEY) {
    headers["Authorization"] = `users API-Key ${API_KEY}`;
  }
  return headers;
}

export async function fetchProductWithMerchantContext(productId: string, merchantId: string | number): Promise<Product | null> {
  const headers = buildHeaders();

  try {
    // 1. Fetch Merchant Product by querying with product_id and merchant_id
    // This mirrors apps/web logic which finds the link between merchant and product
    const mpRes = await fetch(
      `${API_BASE}/merchant-products?where[product_id][equals]=${productId}&where[merchant_id][equals]=${merchantId}&depth=2&limit=1`, 
      { headers }
    );

    if (!mpRes.ok) {
      console.error('Failed to load merchant product:', mpRes.status);
      return null;
    }

    const mpData = await mpRes.json();
    const merchantProduct = mpData.docs && mpData.docs.length > 0 ? mpData.docs[0] : null;

    if (!merchantProduct) {
      console.error('Merchant product not found for this merchant');
      // Optionally fallback to fetching product directly if strictly needed, 
      // but for a merchant app, we generally want the merchant context.
      return null;
    }

    const productData = merchantProduct.product_id;

    if (!productData || typeof productData !== 'object') {
      console.error('Product data missing or not populated');
      return null;
    }

    // Use merchant product overrides
    const finalProduct: Product = {
      ...productData,
      id: productData.id, // Ensure we keep original product ID for fetching modifiers
      merchantProductId: merchantProduct.id, // Add merchantProductId reference for cart/wishlist
      name: merchantProduct.display_title || merchantProduct.name || productData.name,
      basePrice: merchantProduct.price || productData.basePrice,
      compareAtPrice: merchantProduct.compareAtPrice || productData.compareAtPrice,
      isAvailable: merchantProduct.is_available ?? productData.isAvailable ?? true,
      merchant: merchantProduct.merchant_id, // Pass the merchant details
    };

    // 2. Fetch Modifier Groups using ORIGINAL product ID
    const groupsRes = await fetch(`${API_BASE}/modifier-groups?where[product_id][equals]=${productData.id}&limit=100&sort=sort_order`, {
      headers,
    });

    let modifierGroups: ModifierGroup[] = [];
    if (groupsRes.ok) {
      const groupsData = await groupsRes.json();
      modifierGroups = groupsData.docs || [];
    }

    // 3. Fetch Modifier Options
    if (modifierGroups.length > 0) {
      const groupIds = modifierGroups.map(g => g.id).join(',');
      const optionsRes = await fetch(`${API_BASE}/modifier-options?where[modifier_group_id][in]=${groupIds}&limit=500&sort=sort_order`, {
        headers,
      });

      let allOptions: ModifierOption[] = [];
      if (optionsRes.ok) {
        const optionsData = await optionsRes.json();
        allOptions = optionsData.docs || [];
      }

      // 4. Associate Options with Groups
      modifierGroups = modifierGroups.map(group => ({
        ...group,
        options: allOptions.filter(opt => {
          const groupId = typeof opt.modifier_group_id === 'object' && opt.modifier_group_id !== null
            ? (opt.modifier_group_id as any).id
            : opt.modifier_group_id;
          return String(groupId) === String(group.id);
        })
      }));
    }

    return {
      ...finalProduct,
      modifierGroups,
    };
  } catch (error) {
    console.error('Error fetching merchant product details:', error);
    return null;
  }
}
