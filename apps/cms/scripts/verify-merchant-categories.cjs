const { Client } = require('pg');
require('dotenv').config();
(async () => {
  const c = new Client({ connectionString: process.env.DATABASE_URI });
  await c.connect();
  const r = await c.query(
    `SELECT m.id, m.outlet_name, mc.name AS cat
     FROM merchants m
     LEFT JOIN merchants_rels r ON r.parent_id = m.id AND r.path = 'merchant_categories'
     LEFT JOIN merchant_categories mc ON mc.id = r.merchant_categories_id
     ORDER BY m.id, r."order"`,
  );
  const byM = {};
  r.rows.forEach((x) => {
    (byM[x.id] = byM[x.id] || { name: x.outlet_name, cats: [] });
    if (x.cat) byM[x.id].cats.push(x.cat);
  });
  Object.keys(byM).forEach((id) =>
    console.log(`merchant ${id} ${byM[id].name} => ${byM[id].cats.join(', ') || '(none)'}`),
  );
  await c.end();
})().catch((e) => {
  console.error('ERR', e.message);
  process.exit(1);
});
