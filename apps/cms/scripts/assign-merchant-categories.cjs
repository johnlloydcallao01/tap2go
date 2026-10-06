/**
 * Assign merchant-categories to merchants based on their product names.
 *
 * Usage:
 *   node scripts/assign-merchant-categories.cjs        # dry run (default)
 *   node scripts/assign-merchant-categories.cjs --apply # write to DB
 *
 * Logic:
 *  - Field: merchants.merchant_categories (relationship, hasMany -> merchant-categories)
 *  - Storage: merchants_rels(parent_id, path='merchant_categories', merchant_categories_id, "order")
 *  - A category is assigned when >= MIN_HITS products of that merchant match
 *    the category keyword rules. Fallback: merchants with any products but no
 *    hits get Main Courses.
 */
const { Client } = require('pg');
require('dotenv').config();

const MIN_HITS = 2;

// slug -> regex rules tested against product name
const RULES = {
  burger: [/burger/i, /loads/i],
  bbq: [/bbq/i, /barbecue/i, /ribs/i, /liempo/i, /lechon/i, /\broast/i, /grill/i, /kebab/i, /sisig/i, /skewer/i, /samgyup/i, /moksal/i, /bulgogi/i],
  pasta: [/pasta/i, /carbonara/i, /spaghetti/i, /pancit/i, /bihon/i, /canton/i, /\blomi\b/i, /japchae/i, /noodle/i, /odeng/i, /tteokbokki/i, /topokki/i],
  salad: [/salad/i, /caesar/i, /kimchi/i, /atsara/i, /gimbap/i, /kimbap/i],
  softdrinks: [/soft\s*drink/i, /\bcoke\b/i, /sprite/i, /soda/i, /mineral water/i, /leche plan/i],
  'fried-chicken': [/fried/i, /crispy/i, /chicken/i, /\bchix\b/i, /wings/i, /nugget/i, /korean fried/i],
  desserts: [/dessert/i, /ice cream/i, /\bcake\b/i, /cookie/i, /leche/i, /halaya/i, /mango graham/i, /nutella/i, /brownie/i, /\bube\b/i, /frappe/i, /bliss/i, /alcapone/i, /oreo dream/i, /royale plan/i],
  beverages: [/beverage/i, /\btea\b/i, /milk tea/i, /milktea/i, /coffee/i, /latte/i, /frappe/i, /lemonade/i, /juice/i, /lasi/i, /\bchai\b/i, /shake/i, /soda/i, /\bwater\b/i, /coke/i, /sprite/i, /mocha/i, /matcha/i, /spanish latte/i],
  'main-courses': [/pizza/i, /pepperoni/i, /mozzarella/i, /hawaiian/i, /biryani/i, /bibimbap/i, /thali/i, /curry/i, /kebab/i, /bulgogi/i, /jjigae/i, /rice/i, /\bmeal\b/i, /combo/i, /platter/i, /party tray/i, /entree/i, /bilao/i, /tapa/i, /sisig/i, /lechon/i, /crispy pata/i, /roast/i, /kimbap/i, /gimbap/i, /carbonara/i, /pastil/i, /siomai/i, /mandoo/i, /pajeon/i, /sundubu/i, /doenjang/i, /budae/i],
  addons: [/addon/i, /add[\s-]?on/i, /\bextra\b/i, /topping/i, /\bcheese\b/i, /mushroom/i, /\bonion\b/i, /pepperoni/i, /\bham\b/i, /bacon/i, /fries/i, /\bsauce\b/i, /condiment/i, /\bdip\b/i, /mozzarella/i, /parmesan/i, /pineapple/i, /bell pepper/i],
};

async function main() {
  const apply = process.argv.includes('--apply');
  const c = new Client({ connectionString: process.env.DATABASE_URI });
  await c.connect();

  const cats = await c.query('SELECT id, name, slug FROM merchant_categories ORDER BY id');
  const bySlug = Object.fromEntries(cats.rows.map((r) => [r.slug, r]));

  const prods = await c.query(
    `SELECT mp.merchant_id_id AS mid, p.name AS product
     FROM merchant_products mp JOIN products p ON p.id = mp.product_id_id`,
  );
  const byMerchant = {};
  prods.rows.forEach((x) => {
    (byMerchant[x.mid] = byMerchant[x.mid] || []).push(x.product);
  });

  const merchants = await c.query('SELECT id, outlet_name FROM merchants ORDER BY id');

  const plan = [];
  for (const m of merchants.rows) {
    const products = byMerchant[m.id] || [];
    const hits = {};
    for (const [slug, regexes] of Object.entries(RULES)) {
      if (!bySlug[slug]) continue;
      const matched = products.filter((p) => regexes.some((re) => re.test(p)));
      hits[slug] = matched;
    }
    let assigned = Object.entries(hits)
      .filter(([, arr]) => arr.length >= MIN_HITS)
      .map(([slug]) => slug);
    // Fallback: merchant with products but nothing reaching threshold -> Main Courses
    if (assigned.length === 0 && products.length > 0 && bySlug['main-courses']) {
      assigned = ['main-courses'];
    }
    plan.push({ merchant: m, products: products.length, hits, assigned });
  }

  console.log(`=== PLAN (mode: ${apply ? 'APPLY' : 'DRY-RUN'}) ===`);
  for (const p of plan) {
    const names = p.assigned.map((s) => `${bySlug[s].name}(${bySlug[s].id})`).join(', ') || '(none)';
    console.log(`merchant ${p.merchant.id} ${p.merchant.outlet_name} [${p.products} products] => ${names}`);
    for (const s of p.assigned) {
      console.log(`    ${s}: ${p.hits[s].length} hits e.g. ${p.hits[s].slice(0, 3).join(' | ')}`);
    }
  }

  if (!apply) {
    console.log('\nDry run only. Re-run with --apply to write.');
    await c.end();
    return;
  }

  await c.query('BEGIN');
  try {
    for (const p of plan) {
      await c.query(
        "DELETE FROM merchants_rels WHERE parent_id = $1 AND path = 'merchant_categories'",
        [p.merchant.id],
      );
      let order = 0;
      for (const s of p.assigned) {
        order += 1;
        await c.query(
          'INSERT INTO merchants_rels(parent_id, path, merchant_categories_id, "order") VALUES ($1, $2, $3, $4)',
          [p.merchant.id, 'merchant_categories', bySlug[s].id, order],
        );
      }
    }
    await c.query('COMMIT');
    console.log('\nApplied successfully.');
  } catch (e) {
    await c.query('ROLLBACK');
    throw e;
  } finally {
    await c.end();
  }
}

main().catch((e) => {
  console.error('ERR', e.message);
  process.exit(1);
});
