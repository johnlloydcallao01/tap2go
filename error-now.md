2025-10-13T02:55:29.299887064Z ==> Detected service running on port 10000
2025-10-13T02:55:29.703941066Z ==> Docs on specifying a port: https://render.com/docs/web-services#port-binding
2025-10-13T02:55:35.073769697Z === GET REQUEST START ===
2025-10-13T02:55:35.073819288Z URL: https://localhost:10000/api/merchants/nearby?customer_id=3
2025-10-13T02:55:35.073834428Z Method: GET
2025-10-13T02:55:35.074021012Z Headers: {
2025-10-13T02:55:35.074027883Z   'accept-encoding': 'gzip, br',
2025-10-13T02:55:35.074032313Z   authorization: 'users API-Key 1331d981-b6b7-4ff5-aab6-b9ddbb0c63ae',
2025-10-13T02:55:35.074036723Z   'cdn-loop': 'cloudflare; loops=1',
2025-10-13T02:55:35.074040543Z   'cf-connecting-ip': '175.176.84.132',
2025-10-13T02:55:35.074045043Z   'cf-ipcountry': 'PH',
2025-10-13T02:55:35.074048643Z   'cf-ray': '98db8f135db25de6-HKG',
2025-10-13T02:55:35.074052283Z   'cf-visitor': '{"scheme":"https"}',
2025-10-13T02:55:35.074055733Z   'content-type': 'application/json',
2025-10-13T02:55:35.074059373Z   host: 'cms.tap2goph.com',
2025-10-13T02:55:35.074063103Z   'render-proxy-ttl': '4',
2025-10-13T02:55:35.074066623Z   'rndr-id': '84490025-a229-478e',
2025-10-13T02:55:35.074070064Z   'true-client-ip': '175.176.84.132',
2025-10-13T02:55:35.074074293Z   'user-agent': 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.4202',
2025-10-13T02:55:35.074078394Z   'x-forwarded-for': '175.176.84.132, 172.68.225.154',
2025-10-13T02:55:35.074096834Z   'x-forwarded-host': 'cms.tap2goph.com',
2025-10-13T02:55:35.074099344Z   'x-forwarded-port': '10000',
2025-10-13T02:55:35.074101554Z   'x-forwarded-proto': 'https',
2025-10-13T02:55:35.074103764Z   'x-request-start': '1760324135065409'
2025-10-13T02:55:35.074105904Z }
2025-10-13T02:55:35.074108144Z Environment: production
2025-10-13T02:55:35.101421771Z [02:55:35] ERROR: Failed query: select "id", "vendor_id", "outlet_name", "outlet_code", "contact_info_phone", "contact_info_email", "contact_info_manager_name", "contact_info_manager_phone", "is_active", "is_accepting_orders", "operational_status", "operating_hours", "special_hours", "delivery_settings_minimum_order_amount", "delivery_settings_delivery_fee", "delivery_settings_free_delivery_threshold", "delivery_settings_estimated_delivery_time_minutes", "delivery_settings_max_delivery_time_minutes", "media_thumbnail_id", "media_store_front_image_id", "media_interior_images", "media_menu_images", "description", "special_instructions", "tags", "active_address_id", "merchant_latitude", "merchant_longitude", "location_accuracy_radius", "delivery_radius_meters", "max_delivery_radius_meters", "min_order_amount", "delivery_fee_base", "delivery_fee_per_km", "free_delivery_threshold", "merchant_coordinates", "service_area_geometry", "priority_zones_geometry", "restricted_areas_geometry", "delivery_zones_geometry", "service_area", "priority_zones", "restricted_areas", "delivery_zones", "avg_delivery_time_minutes", "delivery_success_rate", "peak_hours_multiplier", "delivery_hours", "is_currently_delivering", "next_available_slot", "updated_at", "created_at" from "merchants" "merchants" where "merchants"."id" = $1 order by "merchants"."created_at" desc limit $2
2025-10-13T02:55:35.101442331Z params: NaN,1
2025-10-13T02:55:35.101445091Z     err: {
2025-10-13T02:55:35.101448961Z       "type": "l",
2025-10-13T02:55:35.101453781Z       "message": "Failed query: select \"id\", \"vendor_id\", \"outlet_name\", \"outlet_code\", \"contact_info_phone\", \"contact_info_email\", \"contact_info_manager_name\", \"contact_info_manager_phone\", \"is_active\", \"is_accepting_orders\", \"operational_status\", \"operating_hours\", \"special_hours\", \"delivery_settings_minimum_order_amount\", \"delivery_settings_delivery_fee\", \"delivery_settings_free_delivery_threshold\", \"delivery_settings_estimated_delivery_time_minutes\", \"delivery_settings_max_delivery_time_minutes\", \"media_thumbnail_id\", \"media_store_front_image_id\", \"media_interior_images\", \"media_menu_images\", \"description\", \"special_instructions\", \"tags\", \"active_address_id\", \"merchant_latitude\", \"merchant_longitude\", \"location_accuracy_radius\", \"delivery_radius_meters\", \"max_delivery_radius_meters\", \"min_order_amount\", \"delivery_fee_base\", \"delivery_fee_per_km\", \"free_delivery_threshold\", \"merchant_coordinates\", \"service_area_geometry\", \"priority_zones_geometry\", \"restricted_areas_geometry\", \"delivery_zones_geometry\", \"service_area\", \"priority_zones\", \"restricted_areas\", \"delivery_zones\", \"avg_delivery_time_minutes\", \"delivery_success_rate\", \"peak_hours_multiplier\", \"delivery_hours\", \"is_currently_delivering\", \"next_available_slot\", \"updated_at\", \"created_at\" from \"merchants\" \"merchants\" where \"merchants\".\"id\" = $1 order by \"merchants\".\"created_at\" desc limit $2\nparams: NaN,1: invalid input syntax for type integer: \"NaN\"",
2025-10-13T02:55:35.101457941Z       "stack":
2025-10-13T02:55:35.101472392Z           Error: Failed query: select "id", "vendor_id", "outlet_name", "outlet_code", "contact_info_phone", "contact_info_email", "contact_info_manager_name", "contact_info_manager_phone", "is_active", "is_accepting_orders", "operational_status", "operating_hours", "special_hours", "delivery_settings_minimum_order_amount", "delivery_settings_delivery_fee", "delivery_settings_free_delivery_threshold", "delivery_settings_estimated_delivery_time_minutes", "delivery_settings_max_delivery_time_minutes", "media_thumbnail_id", "media_store_front_image_id", "media_interior_images", "media_menu_images", "description", "special_instructions", "tags", "active_address_id", "merchant_latitude", "merchant_longitude", "location_accuracy_radius", "delivery_radius_meters", "max_delivery_radius_meters", "min_order_amount", "delivery_fee_base", "delivery_fee_per_km", "free_delivery_threshold", "merchant_coordinates", "service_area_geometry", "priority_zones_geometry", "restricted_areas_geometry", "delivery_zones_geometry", "service_area", "priority_zones", "restricted_areas", "delivery_zones", "avg_delivery_time_minutes", "delivery_success_rate", "peak_hours_multiplier", "delivery_hours", "is_currently_delivering", "next_available_slot", "updated_at", "created_at" from "merchants" "merchants" where "merchants"."id" = $1 order by "merchants"."created_at" desc limit $2
2025-10-13T02:55:35.101489932Z           params: NaN,1
2025-10-13T02:55:35.101493372Z               at b.queryWithCache (/opt/render/project/src/apps/cms/.next/server/chunks/877.js:419:718)
2025-10-13T02:55:35.101496052Z               at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
2025-10-13T02:55:35.101498302Z               at async /opt/render/project/src/apps/cms/.next/server/chunks/877.js:412:176065
2025-10-13T02:55:35.101500392Z               at async p (/opt/render/project/src/apps/cms/.next/server/chunks/877.js:338:14585)
2025-10-13T02:55:35.101503082Z               at async Object.o [as findOne] (/opt/render/project/src/apps/cms/.next/server/chunks/877.js:338:17555)
2025-10-13T02:55:35.101505262Z               at async v (/opt/render/project/src/apps/cms/.next/server/chunks/877.js:421:40565)
2025-10-13T02:55:35.101507653Z               at async e0 (/opt/render/project/src/apps/cms/.next/server/chunks/877.js:421:76368)
2025-10-13T02:55:35.101509762Z               at async u (/opt/render/project/src/apps/cms/.next/server/chunks/7984.js:1:3838)
2025-10-13T02:55:35.101511813Z               at async /opt/render/project/src/apps/cms/.next/server/chunks/7984.js:1:6641
2025-10-13T02:55:35.101513873Z               at async /opt/render/project/src/apps/cms/.next/server/app/(payload)/api/[...slug]/route.js:1:4893
2025-10-13T02:55:35.101516883Z           caused by: error: invalid input syntax for type integer: "NaN"
2025-10-13T02:55:35.101518983Z               at /opt/render/project/src/node_modules/.pnpm/pg-pool@3.10.1_pg@8.16.3/node_modules/pg-pool/index.js:45:11
2025-10-13T02:55:35.101521043Z               at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
2025-10-13T02:55:35.101523113Z               at async /opt/render/project/src/apps/cms/.next/server/chunks/877.js:412:176275
2025-10-13T02:55:35.101525163Z               at async b.queryWithCache (/opt/render/project/src/apps/cms/.next/server/chunks/877.js:419:693)
2025-10-13T02:55:35.101527463Z               at async /opt/render/project/src/apps/cms/.next/server/chunks/877.js:412:176065
2025-10-13T02:55:35.101529553Z               at async p (/opt/render/project/src/apps/cms/.next/server/chunks/877.js:338:14585)
2025-10-13T02:55:35.101531663Z               at async Object.o [as findOne] (/opt/render/project/src/apps/cms/.next/server/chunks/877.js:338:17555)
2025-10-13T02:55:35.101533763Z               at async v (/opt/render/project/src/apps/cms/.next/server/chunks/877.js:421:40565)
2025-10-13T02:55:35.101535823Z               at async e0 (/opt/render/project/src/apps/cms/.next/server/chunks/877.js:421:76368)
2025-10-13T02:55:35.101537893Z               at async u (/opt/render/project/src/apps/cms/.next/server/chunks/7984.js:1:3838)
2025-10-13T02:55:35.101550543Z       "query": "select \"id\", \"vendor_id\", \"outlet_name\", \"outlet_code\", \"contact_info_phone\", \"contact_info_email\", \"contact_info_manager_name\", \"contact_info_manager_phone\", \"is_active\", \"is_accepting_orders\", \"operational_status\", \"operating_hours\", \"special_hours\", \"delivery_settings_minimum_order_amount\", \"delivery_settings_delivery_fee\", \"delivery_settings_free_delivery_threshold\", \"delivery_settings_estimated_delivery_time_minutes\", \"delivery_settings_max_delivery_time_minutes\", \"media_thumbnail_id\", \"media_store_front_image_id\", \"media_interior_images\", \"media_menu_images\", \"description\", \"special_instructions\", \"tags\", \"active_address_id\", \"merchant_latitude\", \"merchant_longitude\", \"location_accuracy_radius\", \"delivery_radius_meters\", \"max_delivery_radius_meters\", \"min_order_amount\", \"delivery_fee_base\", \"delivery_fee_per_km\", \"free_delivery_threshold\", \"merchant_coordinates\", \"service_area_geometry\", \"priority_zones_geometry\", \"restricted_areas_geometry\", \"delivery_zones_geometry\", \"service_area\", \"priority_zones\", \"restricted_areas\", \"delivery_zones\", \"avg_delivery_time_minutes\", \"delivery_success_rate\", \"peak_hours_multiplier\", \"delivery_hours\", \"is_currently_delivering\", \"next_available_slot\", \"updated_at\", \"created_at\" from \"merchants\" \"merchants\" where \"merchants\".\"id\" = $1 order by \"merchants\".\"created_at\" desc limit $2",
2025-10-13T02:55:35.101563003Z       "params": [
2025-10-13T02:55:35.101565314Z         null,
2025-10-13T02:55:35.101567414Z         1
2025-10-13T02:55:35.101569504Z       ]
2025-10-13T02:55:35.101571594Z     }
2025-10-13T02:55:35.10188368Z === GET REQUEST SUCCESS ===
2025-10-13T02:55:35.101902861Z Status: 500