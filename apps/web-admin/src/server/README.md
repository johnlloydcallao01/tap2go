# Admin App Server Directory

This directory contains server-side business logic specific to the Admin application.

## Purpose

This `server/` directory follows our monorepo architecture pattern where each Next.js app can have its own app-specific server-side logic, separate from shared packages.

## Structure

```
src/server/
├── README.md           # This file
└── services/          # Admin-specific server services (to be created)
    ├── users.ts       # User management operations
    ├── analytics.ts   # Platform analytics and reporting
    ├── moderation.ts  # Content moderation logic
    ├── system.ts      # System administration tasks
    ├── reports.ts     # Admin reporting and exports
    └── audit.ts       # Audit logging and compliance
```

## When to Add Logic Here

Add server-side logic to this directory when it is:
- **Admin-specific**: Logic that only applies to administrative operations
- **Server-side**: Requires server environment (API keys, database access, etc.)
- **Not shared**: Logic that other apps (web, driver, vendor) don't need

## Examples of Admin-Specific Server Logic

- User management and moderation
- Platform-wide analytics and reporting
- System configuration management
- Audit logging and compliance
- Data export and import operations
- Platform monitoring and health checks
- Administrative notifications
- Bulk operations and data management

## Shared vs App-Specific

**Use shared packages for:**
- Common business logic (`packages/business-logic/`)
- Database operations (`packages/database/`)
- API clients (`packages/api-client/`)
- Authentication (`packages/shared-auth/`)

**Use this directory for:**
- Admin-only server operations
- Administrative integrations
- Platform management logic

## Architecture Benefits

This structure provides:
- **Separation of concerns**: Admin logic stays with admin app
- **Independent deployment**: Admin app can be deployed separately
- **Code organization**: Clear boundaries between shared and app-specific code
- **Future scalability**: Easy to extract to microservices if needed

## Getting Started

When you're ready to add admin-specific server logic:

1. Create the appropriate service file in `services/`
2. Import shared utilities from packages as needed
3. Export functions for use in API routes or server components
4. Follow the same patterns established in `apps/web/src/server/`

## Related Documentation

- See `apps/web/src/server/` for implementation examples
- See `packages/business-logic/` for shared business rules
- See our monorepo architecture documentation
