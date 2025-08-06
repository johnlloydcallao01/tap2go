# Enterprise Server Architecture Documentation

This document provides comprehensive documentation for the enterprise-level server architecture implemented across all Next.js applications in the Tap2Go monorepo.

## 🏗️ Architecture Overview

Our server architecture follows enterprise best practices with clear separation of concerns, consistent patterns, and scalable design principles.

### Core Principles

1. **Separation of Concerns**: Each directory has a specific responsibility
2. **Consistency**: Same structure across all applications
3. **Scalability**: Easy to extend and maintain as the team grows
4. **Type Safety**: Full TypeScript coverage with strict typing
5. **Security**: Built-in authentication, authorization, and validation
6. **Performance**: Optimized for enterprise-level traffic

## 📁 Universal Server Structure

Every Next.js application (`web`, `web-admin`, `web-driver`, `web-vendor`) follows this structure:

```
src/server/
├── actions/          # Server Actions (Next.js App Router)
├── middleware/       # Request/response middleware
├── services/         # Business logic services
├── types/           # Server-specific TypeScript types
├── utils/           # Server utility functions
└── validators/      # Input validation schemas
```

## 🎯 Directory Purposes

### `actions/` - Server Actions
**Purpose**: Handle form submissions and mutations in Next.js App Router
**When to use**: Form processing, data mutations, user interactions

**Key Features**:
- Server-side form validation
- Automatic revalidation
- Type-safe form handling
- Error handling and user feedback

**Example Structure**:
```typescript
// actions/auth-actions.ts
'use server';

export async function loginUser(
  prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  // Validation, processing, revalidation
}
```

### `middleware/` - Server Middleware
**Purpose**: Cross-cutting concerns like authentication, logging, rate limiting
**When to use**: Request/response processing, security, monitoring

**Key Features**:
- Authentication and authorization
- Rate limiting and abuse prevention
- Request/response logging
- CORS handling
- Error handling

**Example Structure**:
```typescript
// middleware/auth-middleware.ts
export function withAuth(handler, options) {
  return async (request, ...args) => {
    // Authentication logic
    return handler(request, authContext, ...args);
  };
}
```

### `services/` - Business Logic Services
**Purpose**: Core business logic and data operations
**When to use**: Complex business rules, external API integrations, data processing

**Key Features**:
- Centralized business logic
- Database operations
- External service integrations
- Caching strategies
- Error handling

**Example Structure**:
```typescript
// services/user-service.ts
class UserService {
  async createUser(data: CreateUserData): Promise<ServiceResult<User>> {
    // Business logic implementation
  }
}

export const userService = new UserService();
```

### `types/` - Server Types
**Purpose**: TypeScript types specific to server-side operations
**When to use**: Type definitions for server-only data structures

**Key Features**:
- Server-specific interfaces
- API request/response types
- Database model types
- Service result types

### `utils/` - Server Utilities
**Purpose**: Helper functions for common server-side operations
**When to use**: Reusable utility functions, formatters, converters

**Key Features**:
- Authentication helpers
- Data formatting utilities
- Cryptographic functions
- Date/time utilities

### `validators/` - Input Validation
**Purpose**: Data validation and sanitization
**When to use**: Input validation, data integrity checks

**Key Features**:
- Comprehensive input validation
- Data sanitization
- Type-safe validation results
- Custom validation rules

## 🚀 Application-Specific Implementations

### Web Application (`apps/web`)
**Focus**: Customer-facing operations, orders, restaurants

**Key Services**:
- `auth-service.ts` - User authentication
- `order-service.ts` - Order processing
- `restaurant-service.ts` - Restaurant data
- `payment-service.ts` - Payment processing

**Key Actions**:
- `auth-actions.ts` - Login, register, profile
- `order-actions.ts` - Create, update, cancel orders
- `restaurant-actions.ts` - Restaurant management

### Admin Application (`apps/web-admin`)
**Focus**: Platform administration, user management, analytics

**Key Services**:
- `admin-auth-service.ts` - Admin authentication
- `user-management-service.ts` - User administration
- `platform-analytics-service.ts` - Platform metrics
- `audit-log-service.ts` - Audit logging

**Key Actions**:
- `admin-auth-actions.ts` - Admin login, permissions
- `user-management-actions.ts` - User CRUD operations
- `platform-management-actions.ts` - Platform settings

### Driver Application (`apps/web-driver`)
**Focus**: Delivery operations, route optimization, earnings

**Key Services**:
- `driver-auth-service.ts` - Driver authentication
- `delivery-service.ts` - Delivery management
- `route-optimization-service.ts` - Route planning
- `earnings-service.ts` - Driver earnings

**Key Actions**:
- `delivery-actions.ts` - Accept, update, complete deliveries
- `route-actions.ts` - Route optimization
- `earnings-actions.ts` - Earnings tracking

### Vendor Application (`apps/web-vendor`)
**Focus**: Restaurant management, menu operations, order fulfillment

**Key Services**:
- `vendor-auth-service.ts` - Vendor authentication
- `restaurant-service.ts` - Restaurant management
- `menu-service.ts` - Menu operations
- `order-service.ts` - Order fulfillment

**Key Actions**:
- `restaurant-actions.ts` - Restaurant CRUD operations
- `menu-actions.ts` - Menu item management
- `order-actions.ts` - Order processing

## 🔒 Security Features

### Authentication & Authorization
- JWT token validation with Firebase Admin
- Role-based access control (RBAC)
- Permission-based authorization
- Session management

### Input Validation
- Comprehensive data validation
- SQL injection prevention
- XSS protection
- File upload security

### Rate Limiting
- Configurable rate limits per endpoint
- IP-based and user-based limiting
- Abuse prevention
- DDoS protection

## 📊 Enterprise Features

### Monitoring & Logging
- Structured logging for all operations
- Performance monitoring
- Error tracking and alerting
- Audit trails

### Caching
- Response caching strategies
- Database query optimization
- CDN integration
- Cache invalidation

### Scalability
- Horizontal scaling support
- Database connection pooling
- Load balancing ready
- Microservices preparation

## 🧪 Testing Strategy

### Unit Testing
```typescript
// __tests__/server/services/auth-service.test.ts
describe('AuthService', () => {
  it('should register a new user', async () => {
    const result = await authService.registerUser(validUserData);
    expect(result.success).toBe(true);
  });
});
```

### Integration Testing
```typescript
// __tests__/server/actions/auth-actions.test.ts
describe('Auth Actions', () => {
  it('should handle user registration', async () => {
    const formData = new FormData();
    formData.append('email', 'test@example.com');
    
    const result = await registerUser(null, formData);
    expect(result.success).toBe(true);
  });
});
```

## 📚 Best Practices

### Code Organization
1. Keep services focused on single responsibilities
2. Use consistent naming conventions
3. Implement proper error handling
4. Write comprehensive tests

### Security
1. Validate all inputs
2. Authenticate all requests
3. Use proper authorization checks
4. Implement rate limiting

### Performance
1. Use caching strategically
2. Optimize database queries
3. Implement proper indexing
4. Monitor performance metrics

### Maintainability
1. Write clear documentation
2. Use TypeScript strictly
3. Follow consistent patterns
4. Implement proper logging

## 🔄 Migration Guide

### From Legacy Code
1. Identify existing server logic
2. Categorize by responsibility (service, action, etc.)
3. Refactor into new structure
4. Add proper types and validation
5. Write tests
6. Update imports

### Example Migration
```typescript
// Before (legacy)
export async function createOrder(data) {
  // Mixed concerns, no validation, no types
}

// After (new structure)
// services/order-service.ts
export async function createOrder(data: CreateOrderData): Promise<ServiceResult<Order>> {
  // Pure business logic
}

// actions/order-actions.ts
export async function createOrder(prevState, formData): Promise<ActionResult> {
  // Form handling, validation, revalidation
}

// validators/order-validators.ts
export function validateOrderData(data): ValidationResult<CreateOrderData> {
  // Input validation
}
```

## 🚀 Getting Started

### 1. Choose the Right Directory
- **Actions**: Form submissions, user interactions
- **Services**: Business logic, data operations
- **Middleware**: Cross-cutting concerns
- **Utils**: Helper functions
- **Validators**: Input validation
- **Types**: Type definitions

### 2. Follow the Patterns
- Use existing examples as templates
- Maintain consistent error handling
- Implement proper TypeScript types
- Add comprehensive validation

### 3. Test Your Code
- Write unit tests for services
- Test actions with form data
- Validate error scenarios
- Check security measures

## 📖 Related Documentation

- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [TypeScript Best Practices](https://typescript-eslint.io/rules/)
- [Enterprise Architecture Patterns](https://martinfowler.com/eaaCatalog/)

---

This architecture provides a solid foundation for enterprise-level development with clear patterns, strong security, and excellent maintainability.
