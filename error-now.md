📋 Found 2 active merchants for vendor 1
❌ Failed to assign product 5 to merchant 10: error: canceling statement due to statement timeout
    at C:\Users\ACER\Desktop\tap2go\node_modules\pg\lib\client.js:545:17 
    at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
    at async file:///C:/Users/ACER/Desktop/tap2go/node_modules/drizzle-orm/node-postgres/session.js:124:18
    at async NodePgPreparedQuery.queryWithCache (file:///C:/Users/ACER/Desktop/tap2go/node_modules/drizzle-orm/pg-core/session.js:40:16)
    at async file:///C:/Users/ACER/Desktop/tap2go/node_modules/drizzle-orm/node-postgres/session.js:117:22
    at async Object.insert (file:///C:/Users/ACER/Desktop/tap2go/node_modules/@payloadcms/drizzle/dist/postgres/insert.js:7:18)
    at async upsertRow (file:///C:/Users/ACER/Desktop/tap2go/node_modules/@payloadcms/drizzle/dist/upsertRow/index.js:128:29)
    at async Object.create (file:///C:/Users/ACER/Desktop/tap2go/node_modules/@payloadcms/drizzle/dist/create.js:8:20)
    at async createOperation (file:///C:/Users/ACER/Desktop/tap2go/node_modules/payload/dist/collections/operations/create.js:177:19)
    at async eval (webpack-internal:///(rsc)/./src/collections/Products.ts:325:57)
    at async Promise.allSettled (index 0)
    at async Products.hooks.afterChange (webpack-internal:///(rsc)/./src/collections/Products.ts:343:41)
    at async updateDocument (file:///C:/Users/ACER/Desktop/tap2go/node_modules/payload/dist/collections/operations/utilities/update.js:270:22)    
    at async updateByIDOperation (file:///C:/Users/ACER/Desktop/tap2go/node_modules/payload/dist/collections/operations/updateByID.js:113:22)     
    at async updateByIDHandler (file:///C:/Users/ACER/Desktop/tap2go/node_modules/payload/dist/collections/endpoints/updateByID.js:17:17)
    at async handleEndpoints (file:///C:/Users/ACER/Desktop/tap2go/node_modules/payload/dist/utilities/handleEndpoints.js:169:26)
    at async eval (webpack-internal:///(rsc)/../../node_modules/@payloadcms/next/dist/routes/rest/index.js:30:20)
    at async eval (webpack-internal:///(rsc)/./src/app/(payload)/api/[...slug]/route.ts:28:28)
    at async AppRouteRouteModule.do (C:\Users\ACER\Desktop\tap2go\apps\cms\node_modules\next\dist\compiled\next-server\app-route.runtime.dev.js:10:32709)
    at async AppRouteRouteModule.handle (C:\Users\ACER\Desktop\tap2go\apps\cms\node_modules\next\dist\compiled\next-server\app-route.runtime.dev.js:10:38210)
    at async doRender (C:\Users\ACER\Desktop\tap2go\apps\cms\node_modules\next\dist\server\base-server.js:1493:42)
    at async responseGenerator (C:\Users\ACER\Desktop\tap2go\apps\cms\node_modules\next\dist\server\base-server.js:1834:28)
    at async DevServer.renderToResponseWithComponentsImpl (C:\Users\ACER\Desktop\tap2go\apps\cms\node_modules\next\dist\server\base-server.js:1878:28)
    at async DevServer.renderPageComponent (C:\Users\ACER\Desktop\tap2go\apps\cms\node_modules\next\dist\server\base-server.js:2292:24)
    at async DevServer.renderToResponseImpl (C:\Users\ACER\Desktop\tap2go\apps\cms\node_modules\next\dist\server\base-server.js:2330:32)
    at async DevServer.pipeImpl (C:\Users\ACER\Desktop\tap2go\apps\cms\node_modules\next\dist\server\base-server.js:984:25)
    at async NextNodeServer.handleCatchallRenderRequest (C:\Users\ACER\Desktop\tap2go\apps\cms\node_modules\next\dist\server\next-server.js:281:17)
    at async DevServer.handleRequestImpl (C:\Users\ACER\Desktop\tap2go\apps\cms\node_modules\next\dist\server\base-server.js:877:17)
    at async C:\Users\ACER\Desktop\tap2go\apps\cms\node_modules\next\dist\server\dev\next-dev-server.js:373:20
    at async Span.traceAsyncFn (C:\Users\ACER\Desktop\tap2go\apps\cms\node_modules\next\dist\trace\trace.js:157:20)
    at async DevServer.handleRequest (C:\Users\ACER\Desktop\tap2go\apps\cms\node_modules\next\dist\server\dev\next-dev-server.js:370:24)
    at async invokeRender (C:\Users\ACER\Desktop\tap2go\apps\cms\node_modules\next\dist\server\lib\router-server.js:183:21)
    at async handleRequest (C:\Users\ACER\Desktop\tap2go\apps\cms\node_modules\next\dist\server\lib\router-server.js:360:24)
    at async requestHandlerImpl (C:\Users\ACER\Desktop\tap2go\apps\cms\node_modules\next\dist\server\lib\router-server.js:384:13)
    at async Server.requestListener (C:\Users\ACER\Desktop\tap2go\apps\cms\node_modules\next\dist\server\lib\start-server.js:142:13) {
  length: 273,
  severity: 'ERROR',
  code: '57014',
  detail: undefined,
  hint: undefined,
  position: undefined,
  internalPosition: undefined,
  internalQuery: undefined,
  where: 'while locking tuple (0,13) in relation "products"\n' +
    'SQL statement "SELECT 1 FROM ONLY "public"."products" x WHERE "id" OPERATOR(pg_catalog.=) $1 FOR KEY SHARE OF x"',
  schema: undefined,
  table: undefined,
  column: undefined,
  dataType: undefined,
  constraint: undefined,
  file: 'postgres.c',
  line: '3405',
  routine: 'ProcessInterrupts'
}
❌ Failed to assign product 5 to merchant 8: error: canceling statement due to statement timeout
    at C:\Users\ACER\Desktop\tap2go\node_modules\pg\lib\client.js:545:17 
    at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
    at async file:///C:/Users/ACER/Desktop/tap2go/node_modules/drizzle-orm/node-postgres/session.js:124:18
    at async NodePgPreparedQuery.queryWithCache (file:///C:/Users/ACER/Desktop/tap2go/node_modules/drizzle-orm/pg-core/session.js:40:16)
    at async file:///C:/Users/ACER/Desktop/tap2go/node_modules/drizzle-orm/node-postgres/session.js:117:22
    at async Object.insert (file:///C:/Users/ACER/Desktop/tap2go/node_modules/@payloadcms/drizzle/dist/postgres/insert.js:7:18)
    at async upsertRow (file:///C:/Users/ACER/Desktop/tap2go/node_modules/@payloadcms/drizzle/dist/upsertRow/index.js:128:29)
    at async Object.create (file:///C:/Users/ACER/Desktop/tap2go/node_modules/@payloadcms/drizzle/dist/create.js:8:20)
    at async createOperation (file:///C:/Users/ACER/Desktop/tap2go/node_modules/payload/dist/collections/operations/create.js:177:19)
    at async eval (webpack-internal:///(rsc)/./src/collections/Products.ts:325:57)
    at async Promise.allSettled (index 1)
    at async Products.hooks.afterChange (webpack-internal:///(rsc)/./src/collections/Products.ts:343:41)
    at async updateDocument (file:///C:/Users/ACER/Desktop/tap2go/node_modules/payload/dist/collections/operations/utilities/update.js:270:22)    
    at async updateByIDOperation (file:///C:/Users/ACER/Desktop/tap2go/node_modules/payload/dist/collections/operations/updateByID.js:113:22)     
    at async updateByIDHandler (file:///C:/Users/ACER/Desktop/tap2go/node_modules/payload/dist/collections/endpoints/updateByID.js:17:17)
    at async handleEndpoints (file:///C:/Users/ACER/Desktop/tap2go/node_modules/payload/dist/utilities/handleEndpoints.js:169:26)
    at async eval (webpack-internal:///(rsc)/../../node_modules/@payloadcms/next/dist/routes/rest/index.js:30:20)
    at async eval (webpack-internal:///(rsc)/./src/app/(payload)/api/[...slug]/route.ts:28:28)
    at async AppRouteRouteModule.do (C:\Users\ACER\Desktop\tap2go\apps\cms\node_modules\next\dist\compiled\next-server\app-route.runtime.dev.js:10:32709)
    at async AppRouteRouteModule.handle (C:\Users\ACER\Desktop\tap2go\apps\cms\node_modules\next\dist\compiled\next-server\app-route.runtime.dev.js:10:38210)
    at async doRender (C:\Users\ACER\Desktop\tap2go\apps\cms\node_modules\next\dist\server\base-server.js:1493:42)
    at async responseGenerator (C:\Users\ACER\Desktop\tap2go\apps\cms\node_modules\next\dist\server\base-server.js:1834:28)
    at async DevServer.renderToResponseWithComponentsImpl (C:\Users\ACER\Desktop\tap2go\apps\cms\node_modules\next\dist\server\base-server.js:1878:28)
    at async DevServer.renderPageComponent (C:\Users\ACER\Desktop\tap2go\apps\cms\node_modules\next\dist\server\base-server.js:2292:24)
    at async DevServer.renderToResponseImpl (C:\Users\ACER\Desktop\tap2go\apps\cms\node_modules\next\dist\server\base-server.js:2330:32)
    at async DevServer.pipeImpl (C:\Users\ACER\Desktop\tap2go\apps\cms\node_modules\next\dist\server\base-server.js:984:25)
    at async NextNodeServer.handleCatchallRenderRequest (C:\Users\ACER\Desktop\tap2go\apps\cms\node_modules\next\dist\server\next-server.js:281:17)
    at async DevServer.handleRequestImpl (C:\Users\ACER\Desktop\tap2go\apps\cms\node_modules\next\dist\server\base-server.js:877:17)
    at async C:\Users\ACER\Desktop\tap2go\apps\cms\node_modules\next\dist\server\dev\next-dev-server.js:373:20
    at async Span.traceAsyncFn (C:\Users\ACER\Desktop\tap2go\apps\cms\node_modules\next\dist\trace\trace.js:157:20)
    at async DevServer.handleRequest (C:\Users\ACER\Desktop\tap2go\apps\cms\node_modules\next\dist\server\dev\next-dev-server.js:370:24)
    at async invokeRender (C:\Users\ACER\Desktop\tap2go\apps\cms\node_modules\next\dist\server\lib\router-server.js:183:21)
    at async handleRequest (C:\Users\ACER\Desktop\tap2go\apps\cms\node_modules\next\dist\server\lib\router-server.js:360:24)
    at async requestHandlerImpl (C:\Users\ACER\Desktop\tap2go\apps\cms\node_modules\next\dist\server\lib\router-server.js:384:13)
    at async Server.requestListener (C:\Users\ACER\Desktop\tap2go\apps\cms\node_modules\next\dist\server\lib\start-server.js:142:13) {
  length: 273,
  severity: 'ERROR',
  code: '57014',
  detail: undefined,
  hint: undefined,
  position: undefined,
  internalPosition: undefined,
  internalQuery: undefined,
  where: 'while locking tuple (0,13) in relation "products"\n' +
    'SQL statement "SELECT 1 FROM ONLY "public"."products" x WHERE "id" OPERATOR(pg_catalog.=) $1 FOR KEY SHARE OF x"',
  schema: undefined,
  table: undefined,
  column: undefined,
  dataType: undefined,
  constraint: undefined,
  file: 'postgres.c',
  line: '3405',
  routine: 'ProcessInterrupts'
}
🎯 Assignment completed: 0 successful, 2 failed/skipped
