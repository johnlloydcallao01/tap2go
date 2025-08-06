# Driver App Server Directory

This directory contains the complete server-side architecture for the Driver application, organized for enterprise-level driver operations and management.

## 🏗️ Architecture Overview

```
src/server/
├── actions/          # Driver Server Actions (Next.js App Router)
├── middleware/       # Driver-specific middleware
├── services/         # Driver business logic services
├── types/           # Driver-specific TypeScript types
├── utils/           # Driver utility functions
└── validators/      # Driver input validation schemas
```

## 📁 Directory Structure

### `actions/` - Driver Server Actions
Server Actions for driver operations and form handling.

### `middleware/` - Driver Middleware
Cross-cutting concerns specific to driver operations.

### `services/` - Driver Business Logic Services
Core driver business logic and data operations.

## When to Add Logic Here

Add server-side logic to this directory when it is:
- **Driver-specific**: Logic that only applies to driver operations
- **Server-side**: Requires server environment (API keys, database access, etc.)
- **Not shared**: Logic that other apps (web, admin, vendor) don't need

## Examples of Driver-Specific Server Logic

- Route optimization algorithms
- Driver earnings calculations
- Delivery status management
- Driver performance analytics
- Vehicle management logic
- Driver document verification

## Shared vs App-Specific

**Use shared packages for:**
- Common business logic (`packages/business-logic/`)
- Database operations (`packages/database/`)
- API clients (`packages/api-client/`)
- Authentication (`packages/shared-auth/`)

**Use this directory for:**
- Driver-only server operations
- Driver-specific integrations
- Driver app business rules

## Architecture Benefits

This structure provides:
- **Separation of concerns**: Driver logic stays with driver app
- **Independent deployment**: Driver app can be deployed separately
- **Code organization**: Clear boundaries between shared and app-specific code
- **Future scalability**: Easy to extract to microservices if needed

## Getting Started

When you're ready to add driver-specific server logic:

1. Create the appropriate service file in `services/`
2. Import shared utilities from packages as needed
3. Export functions for use in API routes or server components
4. Follow the same patterns established in `apps/web/src/server/`

## Related Documentation

- See `apps/web/src/server/` for implementation examples
- See `packages/business-logic/` for shared business rules
- See our monorepo architecture documentation
