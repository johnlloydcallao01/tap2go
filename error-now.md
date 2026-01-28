Environment: development
Params: { slug: [ 'users' ] }
[20:06:56] ERROR: insert or update on table "customers" violates foreign key constraint "customers_user_id_users_id_fk"
    err: {
      "type": "DatabaseError",
      "message": "insert or update on table \"customers\" violates foreign key constraint \"customers_user_id_users_id_fk\"",
      "stack":
          error: insert or update on table "customers" violates foreign key constraint "customers_user_id_users_id_fk"
              at C:\Users\User\Desktop\tap2go\node_modules\.pnpm\pg@8.16.3\node_modules\pg\lib\client.js:545:17
              at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
              at async file:///C:/Users/User/Desktop/tap2go/node_modules/.pnpm/drizzle-orm@0.44.2_@types+pg@8.10.2_@upstash+redis@1.35.5_pg@8.16.3/node_modules/drizzle-orm/node-postgres/session.js:124:18
              at async NodePgPreparedQuery.queryWithCache (file:///C:/Users/User/Desktop/tap2go/node_modules/.pnpm/drizzle-orm@0.44.2_@types+pg@8.10.2_@upstash+redis@1.35.5_pg@8.16.3/node_modules/drizzle-orm/pg-core/session.js:40:16)
              at async file:///C:/Users/User/Desktop/tap2go/node_modules/.pnpm/drizzle-orm@0.44.2_@types+pg@8.10.2_@upstash+redis@1.35.5_pg@8.16.3/node_modules/drizzle-orm/node-postgres/session.js:117:22
              at async Object.insert (file:///C:/Users/User/Desktop/tap2go/node_modules/.pnpm/@payloadcms+drizzle@3.49.0_@types+pg@8.10.2_@upstash+redis@1.35.5_payload@3.49.0_graphql@16.1_cjryfa5xxuc2kmxoegyyrntdni/node_modules/@payloadcms/drizzle/dist/postgres/insert.js:7:18)       
              at async upsertRow (file:///C:/Users/User/Desktop/tap2go/node_modules/.pnpm/@payloadcms+drizzle@3.49.0_@types+pg@8.10.2_@upstash+redis@1.35.5_payload@3.49.0_graphql@16.1_cjryfa5xxuc2kmxoegyyrntdni/node_modules/@payloadcms/drizzle/dist/upsertRow/index.js:128:29)
              at async Object.create (file:///C:/Users/User/Desktop/tap2go/node_modules/.pnpm/@payloadcms+drizzle@3.49.0_@types+pg@8.10.2_@upstash+redis@1.35.5_payload@3.49.0_graphql@16.1_cjryfa5xxuc2kmxoegyyrntdni/node_modules/@payloadcms/drizzle/dist/create.js:8:20)
              at async createOperation (file:///C:/Users/User/Desktop/tap2go/node_modules/.pnpm/payload@3.49.0_graphql@16.11.0_typescript@5.7.3/node_modules/payload/dist/collections/operations/create.js:168:19)
              at async createHandler (file:///C:/Users/User/Desktop/tap2go/node_modules/.pnpm/payload@3.49.0_graphql@16.11.0_typescript@5.7.3/node_modules/payload/dist/collections/endpoints/create.js:16:17)
              at async handleEndpoints (file:///C:/Users/User/Desktop/tap2go/node_modules/.pnpm/payload@3.49.0_graphql@16.11.0_typescript@5.7.3/node_modules/payload/dist/utilities/handleEndpoints.js:169:26)
              at async C:\Users\User\Desktop\tap2go\apps\cms\.next\dev\server\chunks\node_modules__pnpm_936025ed._.js:18774:26
              at async C:\Users\User\Desktop\tap2go\apps\cms\.next\dev\server\chunks\[root-of-the-server]__f7aafd09._.js:11608:28
              at async AppRouteRouteModule.do (C:\Users\User\Desktop\tap2go\node_modules\.pnpm\next@16.0.7_@babel+core@7.28.5_@playwright+test@1.50.0_react-dom@19.1.0_react@19.1.0__react@19.1.0_sass@1.77.4\node_modules\next\dist\compiled\next-server\app-route-turbo.runtime.dev.js:5:37789)
              at async AppRouteRouteModule.handle (C:\Users\User\Desktop\tap2go\node_modules\.pnpm\next@16.0.7_@babel+core@7.28.5_@playwright+test@1.50.0_react-dom@19.1.0_react@19.1.0__react@19.1.0_sass@1.77.4\node_modules\next\dist\compiled\next-server\app-route-turbo.runtime.dev.js:5:45045)
              at async responseGenerator (C:\Users\User\Desktop\tap2go\apps\cms\.next\dev\server\chunks\39dc8_next_72c68dd5._.js:9068:38)     
              at async AppRouteRouteModule.handleResponse (C:\Users\User\Desktop\tap2go\node_modules\.pnpm\next@16.0.7_@babel+core@7.28.5_@playwright+test@1.50.0_react-dom@19.1.0_react@19.1.0__react@19.1.0_sass@1.77.4\node_modules\next\dist\compiled\next-server\app-route-turbo.runtime.dev.js:1:187851)
              at async handleResponse (C:\Users\User\Desktop\tap2go\apps\cms\.next\dev\server\chunks\39dc8_next_72c68dd5._.js:9130:32)        
              at async handler (C:\Users\User\Desktop\tap2go\apps\cms\.next\dev\server\chunks\39dc8_next_72c68dd5._.js:9183:13)
              at async DevServer.renderToResponseWithComponentsImpl (C:\Users\User\Desktop\tap2go\node_modules\.pnpm\next@16.0.7_@babel+core@7.28.5_@playwright+test@1.50.0_react-dom@19.1.0_react@19.1.0__react@19.1.0_sass@1.77.4\node_modules\next\dist\server\base-server.js:1413:9)    
              at async DevServer.renderPageComponent (C:\Users\User\Desktop\tap2go\node_modules\.pnpm\next@16.0.7_@babel+core@7.28.5_@playwright+test@1.50.0_react-dom@19.1.0_react@19.1.0__react@19.1.0_sass@1.77.4\node_modules\next\dist\server\base-server.js:1465:24)
              at async DevServer.renderToResponseImpl (C:\Users\User\Desktop\tap2go\node_modules\.pnpm\next@16.0.7_@babel+core@7.28.5_@playwright+test@1.50.0_react-dom@19.1.0_react@19.1.0__react@19.1.0_sass@1.77.4\node_modules\next\dist\server\base-server.js:1515:32)
              at async DevServer.pipeImpl (C:\Users\User\Desktop\tap2go\node_modules\.pnpm\next@16.0.7_@babel+core@7.28.5_@playwright+test@1.50.0_react-dom@19.1.0_react@19.1.0__react@19.1.0_sass@1.77.4\node_modules\next\dist\server\base-server.js:1021:25)
              at async NextNodeServer.handleCatchallRenderRequest (C:\Users\User\Desktop\tap2go\node_modules\.pnpm\next@16.0.7_@babel+core@7.28.5_@playwright+test@1.50.0_react-dom@19.1.0_react@19.1.0__react@19.1.0_sass@1.77.4\node_modules\next\dist\server\next-server.js:394:17)      
              at async DevServer.handleRequestImpl (C:\Users\User\Desktop\tap2go\node_modules\.pnpm\next@16.0.7_@babel+core@7.28.5_@playwright+test@1.50.0_react-dom@19.1.0_react@19.1.0__react@19.1.0_sass@1.77.4\node_modules\next\dist\server\base-server.js:912:17)
              at async C:\Users\User\Desktop\tap2go\node_modules\.pnpm\next@16.0.7_@babel+core@7.28.5_@playwright+test@1.50.0_react-dom@19.1.0_react@19.1.0__react@19.1.0_sass@1.77.4\node_modules\next\dist\server\dev\next-dev-server.js:382:20
              at async Span.traceAsyncFn (C:\Users\User\Desktop\tap2go\node_modules\.pnpm\next@16.0.7_@babel+core@7.28.5_@playwright+test@1.50.0_react-dom@19.1.0_react@19.1.0__react@19.1.0_sass@1.77.4\node_modules\next\dist\trace\trace.js:157:20)
              at async DevServer.handleRequest (C:\Users\User\Desktop\tap2go\node_modules\.pnpm\next@16.0.7_@babel+core@7.28.5_@playwright+test@1.50.0_react-dom@19.1.0_react@19.1.0__react@19.1.0_sass@1.77.4\node_modules\next\dist\server\dev\next-dev-server.js:378:24)
              at async invokeRender (C:\Users\User\Desktop\tap2go\node_modules\.pnpm\next@16.0.7_@babel+core@7.28.5_@playwright+test@1.50.0_react-dom@19.1.0_react@19.1.0__react@19.1.0_sass@1.77.4\node_modules\next\dist\server\lib\router-server.js:240:21)
              at async handleRequest (C:\Users\User\Desktop\tap2go\node_modules\.pnpm\next@16.0.7_@babel+core@7.28.5_@playwright+test@1.50.0_react-dom@19.1.0_react@19.1.0__react@19.1.0_sass@1.77.4\node_modules\next\dist\server\lib\router-server.js:436:24)
              at async requestHandlerImpl (C:\Users\User\Desktop\tap2go\node_modules\.pnpm\next@16.0.7_@babel+core@7.28.5_@playwright+test@1.50.0_react-dom@19.1.0_react@19.1.0__react@19.1.0_sass@1.77.4\node_modules\next\dist\server\lib\router-server.js:484:13)
              at async Server.requestListener (C:\Users\User\Desktop\tap2go\node_modules\.pnpm\next@16.0.7_@babel+core@7.28.5_@playwright+test@1.50.0_react-dom@19.1.0_react@19.1.0__react@19.1.0_sass@1.77.4\node_modules\next\dist\server\lib\start-server.js:226:13)
      "length": 504,
      "name": "error",
      "severity": "ERROR",
      "code": "23503",
      "detail": "Key (user_id)=(38) is not present in table \"users\".",
      "where": "SQL statement \"INSERT INTO customers (user_id, email)\n          SELECT NEW.id, NEW.email\n          WHERE NOT EXISTS (SELECT 1 FROM customers WHERE user_id = NEW.id)\"\nPL/pgSQL function handle_role_change() line 33 at SQL statement",
      "schema": "public",
      "table": "customers",
      "constraint": "customers_user_id_users_id_fk",
      "file": "ri_triggers.c",
      "line": "2599",
      "routine": "ri_ReportViolation"
    }
=== POST REQUEST SUCCESS ===
Status: 500
 POST /api/users?depth=0&fallback-locale=null 500 in 667ms (compile: 10ms, proxy.ts: 5ms, render: 652ms)
