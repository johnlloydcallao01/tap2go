✓] Pulling schema from database...
 ⨯ ..\..\src\pg-core\session.ts (74:11) @ NodePgPreparedQuery.queryWithCache
 ⨯ Error: Failed query: ALTER TABLE "merchants" ALTER COLUMN "priority_zones" SET DATA TYPE jsonb;
params: 
digest: "1034462775"
Cause: error: column "priority_zones" cannot be cast automatically to type jsonb
    at C:\Users\ACER\Desktop\tap2go\node_modules\pg-pool\index.js:45:11
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async file:///C:/Users/ACER/Desktop/tap2go/node_modules/drizzle-orm/node-postgres/session.js:113:20
    at async NodePgPreparedQuery.queryWithCache (file:///C:/Users/ACER/Desktop/tap2go/node_modules/drizzle-orm/pg-core/session.js:40:16)
    at async Object.query (C:\Users\ACER\Desktop\tap2go\node_modules\drizzle-kit\api.js:48470:19)
    at async apply (C:\Users\ACER\Desktop\tap2go\node_modules\drizzle-kit\api.js:48508:9)
    at async pushDevSchema (file:///C:/Users/ACER/Desktop/tap2go/node_modules/@payloadcms/drizzle/dist/utilities/pushDevSchema.js:61:5)
    at async Object.connect (file:///C:/Users/ACER/Desktop/tap2go/node_modules/@payloadcms/db-postgres/dist/connect.js:110:9)
    at async BasePayload.init (file:///C:/Users/ACER/Desktop/tap2go/node_modules/payload/dist/index.js:317:13)
    at async getPayload (file:///C:/Users/ACER/Desktop/tap2go/node_modules/payload/dist/index.js:523:26)
    at async eval (webpack-internal:///(rsc)/../../node_modules/@payloadcms/next/dist/utilities/initReq.js:36:21) {
  length: 195,
  severity: 'ERROR',
  code: '42804',
  detail: undefined,
  hint: 'You might need to specify "USING priority_zones::jsonb".',
  position: undefined,
  internalPosition: undefined,
  internalQuery: undefined,
  where: undefined,
  schema: undefined,
  table: undefined,
  column: undefined,
  dataType: undefined,
  constraint: undefined,
  file: 'tablecmds.c',
  line: '12891',
  routine: 'ATPrepAlterColumnType'
}
  72 |                          return await query();
  73 |                  } catch (e) {
> 74 |                          throw new DrizzleQueryError(queryString, params, e
 as Error);
     |                                ^
  75 |                  }
  76 |          }
  77 |
 ⨯ ..\..\src\pg-core\session.ts (74:11) @ NodePgPreparedQuery.queryWithCache      
 ⨯ Error: Failed query: ALTER TABLE "merchants" ALTER COLUMN "priority_zones" SET DATA TYPE jsonb;
params:
digest: "1034462775"
Cause: error: column "priority_zones" cannot be cast automatically to type jsonb  
    at C:\Users\ACER\Desktop\tap2go\node_modules\pg-pool\index.js:45:11
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async file:///C:/Users/ACER/Desktop/tap2go/node_modules/drizzle-orm/node-postgres/session.js:113:20
    at async NodePgPreparedQuery.queryWithCache (file:///C:/Users/ACER/Desktop/tap2go/node_modules/drizzle-orm/pg-core/session.js:40:16)
    at async Object.query (C:\Users\ACER\Desktop\tap2go\node_modules\drizzle-kit\api.js:48470:19)
    at async apply (C:\Users\ACER\Desktop\tap2go\node_modules\drizzle-kit\api.js:48508:9)
    at async pushDevSchema (file:///C:/Users/ACER/Desktop/tap2go/node_modules/@payloadcms/drizzle/dist/utilities/pushDevSchema.js:61:5)
    at async Object.connect (file:///C:/Users/ACER/Desktop/tap2go/node_modules/@payloadcms/db-postgres/dist/connect.js:110:9)
    at async BasePayload.init (file:///C:/Users/ACER/Desktop/tap2go/node_modules/payload/dist/index.js:317:13)
    at async getPayload (file:///C:/Users/ACER/Desktop/tap2go/node_modules/payload/dist/index.js:523:26)
    at async eval (webpack-internal:///(rsc)/../../node_modules/@payloadcms/next/dist/utilities/initReq.js:36:21) {
  length: 195,
  severity: 'ERROR',
  code: '42804',
  detail: undefined,
  hint: 'You might need to specify "USING priority_zones::jsonb".',
  position: undefined,
  internalPosition: undefined,
  internalQuery: undefined,
  where: undefined,
  schema: undefined,
  table: undefined,
  column: undefined,
  dataType: undefined,
  constraint: undefined,
  file: 'tablecmds.c',
  line: '12891',
  routine: 'ATPrepAlterColumnType'
}
  72 |                          return await query();
  73 |                  } catch (e) {
> 74 |                          throw new DrizzleQueryError(queryString, params, e
 as Error);
     |                                ^
  75 |                  }
  76 |          }
  77 |
 ⨯ ..\..\src\pg-core\session.ts (74:11) @ NodePgPreparedQuery.queryWithCache
 ⨯ Error: Failed query: ALTER TABLE "merchants" ALTER COLUMN "priority_zones" SET DATA TYPE jsonb;
params:
digest: "1034462775"
Cause: error: column "priority_zones" cannot be cast automatically to type jsonb  
    at C:\Users\ACER\Desktop\tap2go\node_modules\pg-pool\index.js:45:11
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async file:///C:/Users/ACER/Desktop/tap2go/node_modules/drizzle-orm/node-postgres/session.js:113:20
    at async NodePgPreparedQuery.queryWithCache (file:///C:/Users/ACER/Desktop/tap2go/node_modules/drizzle-orm/pg-core/session.js:40:16)
    at async Object.query (C:\Users\ACER\Desktop\tap2go\node_modules\drizzle-kit\api.js:48470:19)
    at async apply (C:\Users\ACER\Desktop\tap2go\node_modules\drizzle-kit\api.js:48508:9)
    at async pushDevSchema (file:///C:/Users/ACER/Desktop/tap2go/node_modules/@payloadcms/drizzle/dist/utilities/pushDevSchema.js:61:5)
    at async Object.connect (file:///C:/Users/ACER/Desktop/tap2go/node_modules/@payloadcms/db-postgres/dist/connect.js:110:9)
    at async BasePayload.init (file:///C:/Users/ACER/Desktop/tap2go/node_modules/payload/dist/index.js:317:13)
    at async getPayload (file:///C:/Users/ACER/Desktop/tap2go/node_modules/payload/dist/index.js:523:26)
    at async eval (webpack-internal:///(rsc)/../../node_modules/@payloadcms/next/dist/utilities/initReq.js:36:21) {
  length: 195,
  severity: 'ERROR',
  code: '42804',
  detail: undefined,
  hint: 'You might need to specify "USING priority_zones::jsonb".',
  position: undefined,
  internalPosition: undefined,
  internalQuery: undefined,
  where: undefined,
  schema: undefined,
  table: undefined,
  column: undefined,
  dataType: undefined,
  constraint: undefined,
  file: 'tablecmds.c',
  line: '12891',
  routine: 'ATPrepAlterColumnType'
}
  72 |                          return await query();
  73 |                  } catch (e) {
> 74 |                          throw new DrizzleQueryError(queryString, params, e
 as Error);
     |                                ^
  75 |                  }
  76 |          }
  77 |
 GET /admin 500 in 60061ms
[11:38:36] WARN: No email adapter provided. Email will be written to console. More info at https://payloadcms.com/docs/email/overview.