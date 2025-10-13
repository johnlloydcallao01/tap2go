2025-10-13T06:50:42.760562394Z     '          ) as distance_meters,\n' +
2025-10-13T06:50:42.760564074Z     '          v.id as vendor_id,\n' +
2025-10-13T06:50:42.760565804Z     '          v.business_name as vendor_business_name,\n' +
2025-10-13T06:50:42.760567604Z     '          v.average_rating as vendor_average_rating,\n' +
2025-10-13T06:50:42.760569224Z     '          v.total_orders as vendor_total_orders,\n' +
2025-10-13T06:50:42.760570874Z     '          v.cuisine_types as vendor_cuisine_types\n' +
2025-10-13T06:50:42.760572574Z     '        FROM merchants m\n' +
2025-10-13T06:50:42.760574284Z     '        LEFT JOIN vendors v ON m.vendor_id = v.id\n' +
2025-10-13T06:50:42.760575954Z     '        WHERE \n' +
2025-10-13T06:50:42.760579524Z     '          m.merchant_coordinates IS NOT NULL\n' +
2025-10-13T06:50:42.760581264Z     '          AND m.is_active = true\n' +
2025-10-13T06:50:42.760583034Z     '          AND m.is_accepting_orders = true\n' +
2025-10-13T06:50:42.760584964Z     '          AND ST_DWithin(\n' +
2025-10-13T06:50:42.760586994Z     '            ST_Transform(ST_GeomFromGeoJSON(m.merchant_coordinates::text), 3857),\n' +
2025-10-13T06:50:42.760588674Z     '            ST_Transform(ST_SetSRID(ST_MakePoint(120.99602949999999, 14.6178887), 4326), 3857),\n' +
2025-10-13T06:50:42.760590334Z     '            50000\n' +
2025-10-13T06:50:42.760592004Z     '          )\n' +
2025-10-13T06:50:42.760593714Z     '        ORDER BY \n' +
2025-10-13T06:50:42.760595364Z     '          ST_Distance(\n' +
2025-10-13T06:50:42.760597124Z     '            ST_Transform(ST_GeomFromGeoJSON(m.merchant_coordinates::text), 3857),\n' +
2025-10-13T06:50:42.760599344Z     '            ST_Transform(ST_SetSRID(ST_MakePoint(120.99602949999999, 14.6178887), 4326), 3857)\n' +
2025-10-13T06:50:42.760602215Z     '          )\n' +
2025-10-13T06:50:42.760604995Z     '        LIMIT 50\n' +
2025-10-13T06:50:42.760607544Z     '        OFFSET 0;\n' +
2025-10-13T06:50:42.760610245Z     '      ',
2025-10-13T06:50:42.760612945Z   params: [],
2025-10-13T06:50:42.760615565Z   cause: error: unknown GeoJSON type
2025-10-13T06:50:42.760618495Z       at /opt/render/project/src/node_modules/.pnpm/pg-pool@3.10.1_pg@8.16.3/node_modules/pg-pool/index.js:45:11
2025-10-13T06:50:42.760621445Z       at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
2025-10-13T06:50:42.760635005Z       at async /opt/render/project/src/apps/cms/.next/server/chunks/877.js:412:176037
2025-10-13T06:50:42.760637005Z       at async b.queryWithCache (/opt/render/project/src/apps/cms/.next/server/chunks/877.js:419:693)
2025-10-13T06:50:42.760638815Z       at async i.findMerchantsWithinRadiusPostGIS (/opt/render/project/src/apps/cms/.next/server/chunks/2687.js:1:71309)
2025-10-13T06:50:42.760640545Z       at async o.getMerchantsForLocationDisplay (/opt/render/project/src/apps/cms/.next/server/chunks/2687.js:1:46582)
2025-10-13T06:50:42.760642335Z       at async s (/opt/render/project/src/apps/cms/.next/server/chunks/2687.js:1:48745)
2025-10-13T06:50:42.760644095Z       at async u (/opt/render/project/src/apps/cms/.next/server/chunks/7984.js:1:3838)
2025-10-13T06:50:42.760645745Z       at async /opt/render/project/src/apps/cms/.next/server/chunks/7984.js:1:6641
2025-10-13T06:50:42.760651496Z       at async /opt/render/project/src/apps/cms/.next/server/app/(payload)/api/[...slug]/route.js:1:4893 {
2025-10-13T06:50:42.760653216Z     length: 76,
2025-10-13T06:50:42.760654966Z     severity: 'ERROR',
2025-10-13T06:50:42.760656626Z     code: 'XX000',
2025-10-13T06:50:42.760658326Z     detail: undefined,
2025-10-13T06:50:42.760659926Z     hint: undefined,
2025-10-13T06:50:42.760661596Z     position: undefined,
2025-10-13T06:50:42.760663286Z     internalPosition: undefined,
2025-10-13T06:50:42.760665446Z     internalQuery: undefined,
2025-10-13T06:50:42.760667096Z     where: undefined,
2025-10-13T06:50:42.760668716Z     schema: undefined,
2025-10-13T06:50:42.760670336Z     table: undefined,
2025-10-13T06:50:42.760671936Z     column: undefined,
2025-10-13T06:50:42.760673556Z     dataType: undefined,
2025-10-13T06:50:42.760675256Z     constraint: undefined,
2025-10-13T06:50:42.760676886Z     file: 'lwgeom_pg.c',
2025-10-13T06:50:42.760678566Z     line: '374',
2025-10-13T06:50:42.760680246Z     routine: 'pg_error'
2025-10-13T06:50:42.760681926Z   }
2025-10-13T06:50:42.760683646Z }
2025-10-13T06:50:42.761047684Z 🔍 Error details: {
2025-10-13T06:50:42.761055474Z   message: 'Failed query: \n' +
2025-10-13T06:50:42.761058594Z     '        SELECT \n' +
2025-10-13T06:50:42.761060934Z     '          m.*,\n' +
2025-10-13T06:50:42.761063505Z     '          ST_Distance(\n' +
2025-10-13T06:50:42.761066575Z     '            ST_Transform(ST_GeomFromGeoJSON(m.merchant_coordinates::text), 3857),\n' +
2025-10-13T06:50:42.761069235Z     '            ST_Transform(ST_SetSRID(ST_MakePoint(120.99602949999999, 14.6178887), 4326), 3857)\n' +
2025-10-13T06:50:42.761072335Z     '          ) as distance_meters,\n' +
2025-10-13T06:50:42.761074745Z     '          v.id as vendor_id,\n' +
2025-10-13T06:50:42.761077395Z     '          v.business_name as vendor_business_name,\n' +
2025-10-13T06:50:42.761079885Z     '          v.average_rating as vendor_average_rating,\n' +
2025-10-13T06:50:42.761082295Z     '          v.total_orders as vendor_total_orders,\n' +
2025-10-13T06:50:42.761084795Z     '          v.cuisine_types as vendor_cuisine_types\n' +
2025-10-13T06:50:42.761087155Z     '        FROM merchants m\n' +
2025-10-13T06:50:42.761089555Z     '        LEFT JOIN vendors v ON m.vendor_id = v.id\n' +
2025-10-13T06:50:42.761092035Z     '        WHERE \n' +
2025-10-13T06:50:42.761094285Z     '          m.merchant_coordinates IS NOT NULL\n' +
2025-10-13T06:50:42.761096805Z     '          AND m.is_active = true\n' +
2025-10-13T06:50:42.761099215Z     '          AND m.is_accepting_orders = true\n' +
2025-10-13T06:50:42.761101606Z     '          AND ST_DWithin(\n' +
2025-10-13T06:50:42.761104015Z     '            ST_Transform(ST_GeomFromGeoJSON(m.merchant_coordinates::text), 3857),\n' +
2025-10-13T06:50:42.761106566Z     '            ST_Transform(ST_SetSRID(ST_MakePoint(120.99602949999999, 14.6178887), 4326), 3857),\n' +
2025-10-13T06:50:42.761109096Z     '            50000\n' +
2025-10-13T06:50:42.761111576Z     '          )\n' +
2025-10-13T06:50:42.761114306Z     '        ORDER BY \n' +
2025-10-13T06:50:42.761119236Z     '          ST_Distance(\n' +
2025-10-13T06:50:42.761121966Z     '            ST_Transform(ST_GeomFromGeoJSON(m.merchant_coordinates::text), 3857),\n' +
2025-10-13T06:50:42.761124546Z     '            ST_Transform(ST_SetSRID(ST_MakePoint(120.99602949999999, 14.6178887), 4326), 3857)\n' +
2025-10-13T06:50:42.761127366Z     '          )\n' +
2025-10-13T06:50:42.761129926Z     '        LIMIT 50\n' +
2025-10-13T06:50:42.761132436Z     '        OFFSET 0;\n' +
2025-10-13T06:50:42.761143966Z     '      \n' +
2025-10-13T06:50:42.761146656Z     'params: ',
2025-10-13T06:50:42.761149336Z   stack: 'Error: Failed query: \n' +
2025-10-13T06:50:42.761151816Z     '        SELECT \n' +
2025-10-13T06:50:42.761154207Z     '          m.*,\n' +
2025-10-13T06:50:42.761156667Z     '          ST_Distance(\n' +
2025-10-13T06:50:42.761159067Z     '            ST_Transform(ST_GeomFromGeoJSON(m.merchant_coordinates::text), 3857),\n' +
2025-10-13T06:50:42.761161437Z     '            ST_Transform(ST_SetSRID(ST_MakePoint(120.99602949999999, 14.6178887), 4326), 3857)\n' +
2025-10-13T06:50:42.761163907Z     '          ) as distance_meters,\n' +
2025-10-13T06:50:42.761166377Z     '          v.id as vendor_id,\n' +
2025-10-13T06:50:42.761168737Z     '          v.business_name as vendor_business_name,\n' +
2025-10-13T06:50:42.761171357Z     '          v.average_rating as vendor_average_rating,\n' +
2025-10-13T06:50:42.761173627Z     '          v.total_orders as vendor_total_orders,\n' +
2025-10-13T06:50:42.761175997Z     '          v.cuisine_types as vendor_cuisine_types\n' +
2025-10-13T06:50:42.761178517Z     '        FROM merchants m\n' +
2025-10-13T06:50:42.761180817Z     '        LEFT JOIN vendors v ON m.vendor_id = v.id\n' +
2025-10-13T06:50:42.761183097Z     '        WHERE \n' +
2025-10-13T06:50:42.761185647Z     '          m.merchant_coordinates IS NOT NULL\n' +
2025-10-13T06:50:42.761188027Z     '          AND m.is_active = true\n' +
2025-10-13T06:50:42.761190257Z     '          AND m.is_accepting_orders = true\n' +
2025-10-13T06:50:42.761192557Z     '          AND ST_DWithin(\n' +
2025-10-13T06:50:42.761195128Z     '            ST_Transform(ST_GeomFromGeoJSON(m.merchant_coordinates::text), 3857),\n' +
2025-10-13T06:50:42.761197628Z     '            ST_Transform(ST_SetSRID(ST_MakePoint(120.99602949999999, 14.6178887), 4326), 3857),\n' +
2025-10-13T06:50:42.761200028Z     '            50000\n' +
2025-10-13T06:50:42.761202538Z     '          )\n' +
2025-10-13T06:50:42.761204958Z     '        ORDER BY \n' +
2025-10-13T06:50:42.761207398Z     '          ST_Distance(\n' +
2025-10-13T06:50:42.761209778Z     '            ST_Transform(ST_GeomFromGeoJSON(m.merchant_coordinates::text), 3857),\n' +
2025-10-13T06:50:42.761235748Z     '            ST_Transform(ST_SetSRID(ST_MakePoint(120.99602949999999, 14.6178887), 4326), 3857)\n' +
2025-10-13T06:50:42.761246079Z     '          )\n' +
2025-10-13T06:50:42.761248549Z     '        LIMIT 50\n' +
2025-10-13T06:50:42.761250829Z     '        OFFSET 0;\n' +
2025-10-13T06:50:42.761253289Z     '      \n' +
2025-10-13T06:50:42.761255789Z     'params: \n' +
2025-10-13T06:50:42.761258229Z     '    at b.queryWithCache (/opt/render/project/src/apps/cms/.next/server/chunks/877.js:419:718)\n' +
2025-10-13T06:50:42.761260829Z     '    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)\n' +
2025-10-13T06:50:42.761263609Z     '    at async i.findMerchantsWithinRadiusPostGIS (/opt/render/project/src/apps/cms/.next/server/chunks/2687.js:1:71309)\n' +
2025-10-13T06:50:42.761266119Z     '    at async o.getMerchantsForLocationDisplay (/opt/render/project/src/apps/cms/.next/server/chunks/2687.js:1:46582)\n' +
2025-10-13T06:50:42.761268609Z     '    at async s (/opt/render/project/src/apps/cms/.next/server/chunks/2687.js:1:48745)\n' +
2025-10-13T06:50:42.761270969Z     '    at async u (/opt/render/project/src/apps/cms/.next/server/chunks/7984.js:1:3838)\n' +
2025-10-13T06:50:42.761273409Z     '    at async /opt/render/project/src/apps/cms/.next/server/chunks/7984.js:1:6641\n' +
2025-10-13T06:50:42.761275979Z     '    at async /opt/render/project/src/apps/cms/.next/server/app/(payload)/api/[...slug]/route.js:1:4893\n' +
2025-10-13T06:50:42.76129588Z     '    at async e5.do (/opt/render/project/src/node_modules/.pnpm/next@15.0.0_@babel+core@7.28.4_@playwright+test@1.50.0_react-dom@19.1.0_react@19.1.0__react@19.1.0_sass@1.77.4/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:18:18072)\n' +
2025-10-13T06:50:42.7612988Z     '    at async e5.handle (/opt/render/project/src/node_modules/.pnpm/next@15.0.0_@babel+core@7.28.4_@playwright+test@1.50.0_react-dom@19.1.0_react@19.1.0__react@19.1.0_sass@1.77.4/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:18:21621)',
2025-10-13T06:50:42.76130146Z   params: {
2025-10-13T06:50:42.76130388Z     latitude: 14.6178887,
2025-10-13T06:50:42.76130631Z     longitude: 120.99602949999999,
2025-10-13T06:50:42.76130886Z     radiusMeters: 50000,
2025-10-13T06:50:42.76131122Z     limit: 50,
2025-10-13T06:50:42.76131378Z     offset: 0
2025-10-13T06:50:42.76131601Z   }
2025-10-13T06:50:42.76131835Z }
2025-10-13T06:50:42.761841542Z 🚨 [2d177361-5363-4cdf-a670-112a55cbeb61] MERCHANT LOCATION-BASED DISPLAY ERROR: {
2025-10-13T06:50:42.761848602Z   errorCode: 'GEOSPATIAL_QUERY_ERROR',
2025-10-13T06:50:42.761851762Z   error: 'Failed to find merchants using PostGIS: Failed query: \n' +
2025-10-13T06:50:42.761854262Z     '        SELECT \n' +
2025-10-13T06:50:42.761857092Z     '          m.*,\n' +
2025-10-13T06:50:42.761859482Z     '          ST_Distance(\n' +
2025-10-13T06:50:42.761861742Z     '            ST_Transform(ST_GeomFromGeoJSON(m.merchant_coordinates::text), 3857),\n' +
2025-10-13T06:50:42.761864162Z     '            ST_Transform(ST_SetSRID(ST_MakePoint(120.99602949999999, 14.6178887), 4326), 3857)\n' +
2025-10-13T06:50:42.761866382Z     '          ) as distance_meters,\n' +
2025-10-13T06:50:42.761868652Z     '          v.id as vendor_id,\n' +
2025-10-13T06:50:42.761871112Z     '          v.business_name as vendor_business_name,\n' +
2025-10-13T06:50:42.761873262Z     '          v.average_rating as vendor_average_rating,\n' +
2025-10-13T06:50:42.761875752Z     '          v.total_orders as vendor_total_orders,\n' +
2025-10-13T06:50:42.761878092Z     '          v.cuisine_types as vendor_cuisine_types\n' +
2025-10-13T06:50:42.761880283Z     '        FROM merchants m\n' +
2025-10-13T06:50:42.761882433Z     '        LEFT JOIN vendors v ON m.vendor_id = v.id\n' +
2025-10-13T06:50:42.761884873Z     '        WHERE \n' +
2025-10-13T06:50:42.761887023Z     '          m.merchant_coordinates IS NOT NULL\n' +
2025-10-13T06:50:42.761889443Z     '          AND m.is_active = true\n' +
2025-10-13T06:50:42.761891603Z     '          AND m.is_accepting_orders = true\n' +
2025-10-13T06:50:42.761894013Z     '          AND ST_DWithin(\n' +
2025-10-13T06:50:42.761896473Z     '            ST_Transform(ST_GeomFromGeoJSON(m.merchant_coordinates::text), 3857),\n' +
2025-10-13T06:50:42.761898743Z     '            ST_Transform(ST_SetSRID(ST_MakePoint(120.99602949999999, 14.6178887), 4326), 3857),\n' +
2025-10-13T06:50:42.761901043Z     '            50000\n' +
2025-10-13T06:50:42.761903333Z     '          )\n' +
2025-10-13T06:50:42.761905533Z     '        ORDER BY \n' +
2025-10-13T06:50:42.761907673Z     '          ST_Distance(\n' +
2025-10-13T06:50:42.761910033Z     '            ST_Transform(ST_GeomFromGeoJSON(m.merchant_coordinates::text), 3857),\n' +
2025-10-13T06:50:42.761912433Z     '            ST_Transform(ST_SetSRID(ST_MakePoint(120.99602949999999, 14.6178887), 4326), 3857)\n' +
2025-10-13T06:50:42.761914543Z     '          )\n' +
2025-10-13T06:50:42.761916913Z     '        LIMIT 50\n' +
2025-10-13T06:50:42.761919253Z     '        OFFSET 0;\n' +
2025-10-13T06:50:42.761921473Z     '      \n' +
2025-10-13T06:50:42.761931064Z     'params: ',
2025-10-13T06:50:42.761934004Z   specificError: 'Geospatial query processing failed',
2025-10-13T06:50:42.761936614Z   stack: undefined,
2025-10-13T06:50:42.761938874Z   responseTime: '140ms',
2025-10-13T06:50:42.761941004Z   context: {
2025-10-13T06:50:42.761943244Z     userId: 2,
2025-10-13T06:50:42.761945544Z     userRole: 'service',
2025-10-13T06:50:42.761947804Z     customerId: '3',
2025-10-13T06:50:42.761950124Z     timestamp: '2025-10-13T06:50:42.761Z',
2025-10-13T06:50:42.761952654Z     requestId: '2d177361-5363-4cdf-a670-112a55cbeb61',
2025-10-13T06:50:42.761955034Z     userAgent: 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.4202',
2025-10-13T06:50:42.761957754Z     ipAddress: '175.176.84.132, 172.71.81.235'
2025-10-13T06:50:42.761960014Z   },
2025-10-13T06:50:42.761962614Z   performance: { responseTimeMs: 140, slowQuery: false, verySlowQuery: false },
2025-10-13T06:50:42.761964965Z   debugging: {
2025-10-13T06:50:42.761967274Z     nodeEnv: 'production',
2025-10-13T06:50:42.761969505Z     memoryUsage: {
2025-10-13T06:50:42.761971714Z       rss: 179687424,
2025-10-13T06:50:42.761974085Z       heapTotal: 82743296,
2025-10-13T06:50:42.761976435Z       heapUsed: 76966040,
2025-10-13T06:50:42.761978705Z       external: 22486608,
2025-10-13T06:50:42.761980875Z       arrayBuffers: 473042
2025-10-13T06:50:42.761983195Z     },
2025-10-13T06:50:42.761985365Z     uptime: 24.433386295
2025-10-13T06:50:42.761987465Z   }
2025-10-13T06:50:42.761989885Z }
2025-10-13T06:50:42.76268783Z === GET REQUEST SUCCESS ===
2025-10-13T06:50:42.762710181Z Status: 500