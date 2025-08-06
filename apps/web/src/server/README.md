# Web App Server Directory

This directory contains the complete server-side architecture for the main web application, organized for enterprise-level development.

## 🏗️ Architecture Overview

```
src/server/
├── actions/          # Server Actions (Next.js App Router)
├── middleware/       # Request/response middleware
├── services/         # Business logic services
├── types/           # Server-specific TypeScript types
├── utils/           # Server utility functions
└── validators/      # Input validation schemas
```

## 📁 Directory Structure

### `actions/` - Server Actions
Server Actions for form handling and mutations in Next.js App Router.

**Files:**
- `index.ts` - Exports all server actions
- `auth-actions.ts` - Authentication actions (login, register, logout)
- `order-actions.ts` - Order management actions
- `restaurant-actions.ts` - Restaurant management actions
- `user-actions.ts` - User profile actions

**Usage:**
```typescript
import { loginUser, registerUser } from '@/server/actions';

// In a form component
<form action={loginUser}>
  {/* form fields */}
</form>
```

### `middleware/` - Server Middleware
Cross-cutting concerns like authentication, logging, rate limiting.

**Files:**
- `index.ts` - Exports all middleware
- `auth-middleware.ts` - Authentication and authorization
- `cors-middleware.ts` - CORS handling
- `logging-middleware.ts` - Request/response logging
- `rate-limit-middleware.ts` - Rate limiting protection
- `validation-middleware.ts` - Input validation
- `error-middleware.ts` - Error handling

**Usage:**
```typescript
import { withAuth, withRateLimit } from '@/server/middleware';

export const POST = withAuth(
  withRateLimit(handler, rateLimitConfigs.api),
  { required: true, roles: ['admin'] }
);
```

### `services/` - Business Logic Services
Core business logic and data operations.

**Files:**
- `index.ts` - Exports all services
- `auth-service.ts` - User authentication and management
- `order-service.ts` - Order processing and management
- `restaurant-service.ts` - Restaurant data management
- `user-service.ts` - User profile management
- `payment-service.ts` - Payment processing
- `notification-service.ts` - Notifications and messaging
- `analytics-service.ts` - Analytics and tracking
- `search-service.ts` - Search functionality
- `file-service.ts` - File upload and management

**Legacy Services (to be refactored):**
- `deliveryService.ts` - Delivery management
- `mapsService.ts` - Maps and location services
- `paymongoService.ts` - PayMongo payment integration
- `orders.ts` - Legacy order operations
- `users.ts` - Legacy user operations
- `vendors.ts` - Legacy vendor operations

**Usage:**
```typescript
import { authService, orderService } from '@/server/services';

const result = await authService.registerUser(userData);
const order = await orderService.createOrder(orderData);
```

### `types/` - Server Types
TypeScript types specific to server-side operations.

**Files:**
- `index.ts` - Exports all types
- `actions.ts` - Server action types and interfaces
- `api.ts` - API request/response types
- `auth.ts` - Authentication types
- `database.ts` - Database operation types
- `services.ts` - Service layer types
- `user.ts` - Server-side user types
- `validation.ts` - Validation types and interfaces

**Usage:**
```typescript
import { ServiceResult, User, ActionResult } from '@/server/types';

function processUser(user: User): ServiceResult<User> {
  // implementation
}
```

### `utils/` - Server Utilities
Helper functions for common server-side operations.

**Files:**
- `index.ts` - Exports all utilities
- `auth-utils.ts` - Authentication helpers
- `date-utils.ts` - Date manipulation
- `error-utils.ts` - Error handling utilities
- `format-utils.ts` - Data formatting
- `hash-utils.ts` - Hashing and encryption
- `validation-utils.ts` - Validation helpers
- `file-utils.ts` - File processing
- `email-utils.ts` - Email utilities
- `sms-utils.ts` - SMS utilities
- `crypto-utils.ts` - Cryptographic functions

**Usage:**
```typescript
import { getCurrentUser, hashPassword, formatCurrency } from '@/server/utils';

const user = await getCurrentUser();
const hashedPwd = await hashPassword(password);
const price = formatCurrency(amount, 'USD');
```

### `validators/` - Input Validation
Validation schemas and functions for data integrity.

**Files:**
- `index.ts` - Exports all validators
- `auth-validators.ts` - Authentication data validation
- `order-validators.ts` - Order data validation
- `restaurant-validators.ts` - Restaurant data validation
- `user-validators.ts` - User data validation
- `file-validators.ts` - File upload validation
- `common-validators.ts` - Common validation functions

**Usage:**
```typescript
import { validateEmail, validateOrderData } from '@/server/validators';

const emailResult = validateEmail(email);
const orderResult = validateOrderData(orderData);
```

## 🚀 Getting Started

### 1. Using Server Actions
```typescript
// In a React component
import { useFormState } from 'react-dom';
import { loginUser } from '@/server/actions';

export function LoginForm() {
  const [state, formAction] = useFormState(loginUser, null);
  
  return (
    <form action={formAction}>
      <input name="email" type="email" required />
      <input name="password" type="password" required />
      <button type="submit">Login</button>
      {state?.errors && (
        <div>{state.errors.join(', ')}</div>
      )}
    </form>
  );
}
```

### 2. Creating API Routes with Middleware
```typescript
// app/api/orders/route.ts
import { withAuth, withRateLimit } from '@/server/middleware';
import { orderService } from '@/server/services';

async function handler(request: NextRequest, { user }: { user: User }) {
  const orderData = await request.json();
  const result = await orderService.createOrder(orderData);
  
  return Response.json(result);
}

export const POST = withAuth(
  withRateLimit(handler, { windowMs: 60000, maxRequests: 10 }),
  { required: true, roles: ['customer'] }
);
```

### 3. Using Services
```typescript
// In a server component or API route
import { authService, orderService } from '@/server/services';

export async function UserDashboard({ userId }: { userId: string }) {
  const user = await authService.getUserById(userId);
  const orders = await orderService.getUserOrders(userId);
  
  return (
    <div>
      <h1>Welcome, {user.data?.name}</h1>
      <OrderList orders={orders.data} />
    </div>
  );
}
```

## 🔒 Security Features

- **Authentication**: JWT token validation with Firebase Admin
- **Authorization**: Role-based access control (RBAC)
- **Rate Limiting**: Configurable rate limits per endpoint
- **Input Validation**: Comprehensive data validation
- **Error Handling**: Secure error responses
- **CORS**: Cross-origin request handling

## 📊 Enterprise Features

- **Logging**: Structured logging for monitoring
- **Analytics**: Event tracking and metrics
- **Caching**: Response caching strategies
- **File Upload**: Secure file handling
- **Email/SMS**: Notification services
- **Database**: Optimized data operations

## 🧪 Testing

Each service and utility should have corresponding tests:

```typescript
// __tests__/server/services/auth-service.test.ts
import { authService } from '@/server/services';

describe('AuthService', () => {
  it('should register a new user', async () => {
    const result = await authService.registerUser({
      email: 'test@example.com',
      password: 'SecurePass123!',
      name: 'Test User',
      role: 'customer'
    });
    
    expect(result.success).toBe(true);
    expect(result.data?.user.email).toBe('test@example.com');
  });
});
```

## 📚 Best Practices

1. **Separation of Concerns**: Keep business logic in services, validation in validators
2. **Error Handling**: Always return structured error responses
3. **Type Safety**: Use TypeScript types for all functions
4. **Security**: Validate all inputs, authenticate all requests
5. **Performance**: Use caching and optimize database queries
6. **Monitoring**: Log important events and errors
7. **Testing**: Write unit tests for all services and utilities

## 🔄 Migration from Legacy Code

The existing services (`deliveryService.ts`, `mapsService.ts`, etc.) are preserved for backward compatibility. Gradually migrate to the new structure:

1. Create new service in the appropriate directory
2. Update imports to use new service
3. Add proper types and validation
4. Write tests for the new service
5. Remove legacy service once migration is complete

## 📖 Related Documentation

- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [TypeScript Best Practices](https://typescript-eslint.io/rules/)
- [Enterprise Architecture Patterns](https://martinfowler.com/eaaCatalog/)
