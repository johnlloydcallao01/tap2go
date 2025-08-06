# Vendor App Server Directory

This directory contains the complete server-side architecture for the Vendor application, organized for enterprise-level vendor operations and restaurant management.

## 🏗️ Architecture Overview

```
src/server/
├── actions/          # Vendor Server Actions (Next.js App Router)
├── middleware/       # Vendor-specific middleware
├── services/         # Vendor business logic services
├── types/           # Vendor-specific TypeScript types
├── utils/           # Vendor utility functions
└── validators/      # Vendor input validation schemas
```

## 📁 Directory Structure

### `actions/` - Vendor Server Actions
Server Actions for vendor operations and restaurant management.

### `middleware/` - Vendor Middleware
Cross-cutting concerns specific to vendor operations.

### `services/` - Vendor Business Logic Services
Core vendor business logic and restaurant management operations.

## When to Add Logic Here

Add server-side logic to this directory when it is:
- **Vendor-specific**: Logic that only applies to vendor operations
- **Server-side**: Requires server environment (API keys, database access, etc.)
- **Not shared**: Logic that other apps (web, admin, driver) don't need

## Examples of Vendor-Specific Server Logic

- Multiple outlets management
- Menu item management and pricing
- Vendor-specific order processing
- Business analytics and reporting
- Earnings and commission calculations
- Promotion and discount management
- Inventory management
- Vendor onboarding workflows

## Shared vs App-Specific

**Use shared packages for:**
- Common business logic (`packages/business-logic/`)
- Database operations (`packages/database/`)
- API clients (`packages/api-client/`)
- Authentication (`packages/shared-auth/`)

**Use this directory for:**
- Vendor-only server operations
- Vendor-specific integrations
- Vendor app business rules

## Architecture Benefits

This structure provides:
- **Separation of concerns**: Vendor logic stays with vendor app
- **Independent deployment**: Vendor app can be deployed separately
- **Code organization**: Clear boundaries between shared and app-specific code
- **Future scalability**: Easy to extract to microservices if needed

## Getting Started

When you're ready to add vendor-specific server logic:

1. Create the appropriate service file in `services/`
2. Import shared utilities from packages as needed
3. Export functions for use in API routes or server components
4. Follow the same patterns established in `apps/web/src/server/`

## Related Documentation

- See `apps/web/src/server/` for implementation examples
- See `packages/business-logic/` for shared business rules
- See our monorepo architecture documentation
