Why the fuck sometimes, the apps/web refer to the customer id 4?? When the real user id is actually not that (3 in this case). Please investigate why this stupid thing happen, unstable, why it has to look for user id 4, is there overcomplicate bullshit logic? Make sure our authentication is correct, stable, consistent, no mistake weird logic:

GET / 200 in 3309ms
 GET /favicon.ico 200 in 120ms
 GET /api/customers/user/4 500 in 11132ms
 ○ Compiling /api/addresses ...
 GET /api/customers/user/4 200 in 2805ms
 ✓ Compiled /api/customers/[id] in 5.1s (766 modules)
 GET / 200 in 619ms
 GET /api/addresses 200 in 7479ms
 GET /api/customers/3 200 in 7316ms
 GET /api/customers/user/4 200 in 7416ms
 GET /api/customers/user/4 200 in 1937ms
 GET /api/customers/3 200 in 1668ms
 GET /api/customers/3 200 in 1114ms