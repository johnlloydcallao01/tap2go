# Server Implementation Examples

This document provides practical examples of how to implement and use the enterprise server architecture across all applications.

## 🎯 Complete Implementation Examples

### Example 1: User Registration Flow

#### 1. Server Action (`actions/auth-actions.ts`)
```typescript
'use server';

import { revalidatePath } from 'next/cache';
import { validateRegistrationData } from '../validators/auth-validators';
import { authService } from '../services/auth-service';
import { ActionResult } from '../types/actions';

export async function registerUser(
  prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  try {
    // Extract form data
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const name = formData.get('name') as string;

    // Validate input
    const validation = validateRegistrationData({ email, password, name });
    if (!validation.success) {
      return { success: false, errors: validation.errors };
    }

    // Process registration
    const result = await authService.registerUser(validation.data!);
    if (!result.success) {
      return { success: false, errors: [result.error!] };
    }

    // Revalidate pages
    revalidatePath('/auth');
    
    return { success: true, message: 'Registration successful' };
  } catch (error) {
    return { success: false, errors: ['Registration failed'] };
  }
}
```

#### 2. Service (`services/auth-service.ts`)
```typescript
import { getAuth } from 'firebase-admin/auth';
import { ServiceResult } from '../types/services';
import { User } from '../types/user';

class AuthService {
  async registerUser(data: {
    email: string;
    password: string;
    name: string;
  }): Promise<ServiceResult<{ user: User; token: string }>> {
    try {
      // Create user in Firebase
      const userRecord = await getAuth().createUser({
        email: data.email,
        password: data.password,
        displayName: data.name,
      });

      // Create user in database
      const user = await this.createUserRecord(userRecord);

      // Generate token
      const token = await getAuth().createCustomToken(userRecord.uid);

      return {
        success: true,
        data: { user, token }
      };
    } catch (error) {
      return {
        success: false,
        error: 'Registration failed'
      };
    }
  }

  private async createUserRecord(userRecord: any): Promise<User> {
    // Database operations
    return {
      id: userRecord.uid,
      email: userRecord.email,
      name: userRecord.displayName,
      role: 'customer',
      isActive: true,
      isVerified: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }
}

export const authService = new AuthService();
```

#### 3. Validator (`validators/auth-validators.ts`)
```typescript
import { ValidationResult } from '../types/validation';

export function validateRegistrationData(data: {
  email: string;
  password: string;
  name: string;
}): ValidationResult<typeof data> {
  const errors: string[] = [];

  // Email validation
  if (!data.email || !isValidEmail(data.email)) {
    errors.push('Valid email is required');
  }

  // Password validation
  if (!data.password || data.password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }

  // Name validation
  if (!data.name || data.name.trim().length < 2) {
    errors.push('Name must be at least 2 characters');
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  return { success: true, data };
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
```

#### 4. React Component Usage
```typescript
'use client';

import { useFormState } from 'react-dom';
import { registerUser } from '@/server/actions/auth-actions';

export function RegistrationForm() {
  const [state, formAction] = useFormState(registerUser, null);

  return (
    <form action={formAction}>
      <input name="email" type="email" required />
      <input name="password" type="password" required />
      <input name="name" type="text" required />
      <button type="submit">Register</button>
      
      {state?.errors && (
        <div className="error">
          {state.errors.map((error, i) => (
            <p key={i}>{error}</p>
          ))}
        </div>
      )}
      
      {state?.success && (
        <div className="success">{state.message}</div>
      )}
    </form>
  );
}
```

### Example 2: API Route with Middleware

#### 1. API Route (`app/api/orders/route.ts`)
```typescript
import { NextRequest } from 'next/server';
import { withAuth, withRateLimit } from '@/server/middleware';
import { orderService } from '@/server/services';
import { validateOrderData } from '@/server/validators';

async function handler(
  request: NextRequest,
  { user }: { user: User }
) {
  try {
    const data = await request.json();
    
    // Validate input
    const validation = validateOrderData(data);
    if (!validation.success) {
      return Response.json(
        { error: 'Invalid data', details: validation.errors },
        { status: 400 }
      );
    }

    // Process order
    const result = await orderService.createOrder({
      ...validation.data!,
      customerId: user.id
    });

    if (!result.success) {
      return Response.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return Response.json(result.data);
  } catch (error) {
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Apply middleware
export const POST = withAuth(
  withRateLimit(handler, {
    windowMs: 60000,
    maxRequests: 10
  }),
  { required: true, roles: ['customer'] }
);
```

#### 2. Middleware Implementation (`middleware/auth-middleware.ts`)
```typescript
import { NextRequest } from 'next/server';
import { getAuth } from 'firebase-admin/auth';

export function withAuth(
  handler: Function,
  options: { required?: boolean; roles?: string[] } = {}
) {
  return async (request: NextRequest, ...args: any[]) => {
    try {
      // Extract token
      const token = request.headers.get('authorization')?.replace('Bearer ', '');
      
      if (!token && options.required) {
        return Response.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }

      let user = null;
      if (token) {
        // Verify token
        const decodedToken = await getAuth().verifyIdToken(token);
        user = await getUserFromToken(decodedToken);

        // Check roles
        if (options.roles && !options.roles.includes(user.role)) {
          return Response.json(
            { error: 'Insufficient permissions' },
            { status: 403 }
          );
        }
      }

      return handler(request, { user }, ...args);
    } catch (error) {
      return Response.json(
        { error: 'Authentication failed' },
        { status: 401 }
      );
    }
  };
}
```

### Example 3: Complex Service with Database Operations

#### Service Implementation (`services/order-service.ts`)
```typescript
import { ServiceResult } from '../types/services';
import { Order, CreateOrderData } from '../types/order';
import { validateOrderData } from '../validators/order-validators';
import { paymentService } from './payment-service';
import { notificationService } from './notification-service';

class OrderService {
  async createOrder(data: CreateOrderData): Promise<ServiceResult<Order>> {
    try {
      // Validate business rules
      const validation = await this.validateOrderBusinessRules(data);
      if (!validation.success) {
        return validation;
      }

      // Calculate totals
      const totals = await this.calculateOrderTotals(data);

      // Create order record
      const order = await this.createOrderRecord({
        ...data,
        ...totals,
        status: 'pending',
        createdAt: new Date()
      });

      // Process payment
      const paymentResult = await paymentService.processPayment({
        orderId: order.id,
        amount: totals.total,
        paymentMethodId: data.paymentMethodId
      });

      if (!paymentResult.success) {
        await this.cancelOrder(order.id, 'Payment failed');
        return { success: false, error: 'Payment processing failed' };
      }

      // Update order status
      await this.updateOrderStatus(order.id, 'confirmed');

      // Send notifications
      await this.sendOrderNotifications(order);

      return { success: true, data: order };
    } catch (error) {
      console.error('Order creation error:', error);
      return { success: false, error: 'Failed to create order' };
    }
  }

  private async validateOrderBusinessRules(
    data: CreateOrderData
  ): Promise<ServiceResult<void>> {
    // Check restaurant availability
    const restaurant = await this.getRestaurant(data.restaurantId);
    if (!restaurant?.isOpen) {
      return { success: false, error: 'Restaurant is currently closed' };
    }

    // Check delivery area
    const isInDeliveryArea = await this.checkDeliveryArea(
      restaurant.location,
      data.deliveryAddress
    );
    if (!isInDeliveryArea) {
      return { success: false, error: 'Address is outside delivery area' };
    }

    // Check minimum order
    const orderTotal = await this.calculateSubtotal(data.items);
    if (orderTotal < restaurant.minimumOrder) {
      return {
        success: false,
        error: `Minimum order is $${restaurant.minimumOrder}`
      };
    }

    return { success: true };
  }

  private async calculateOrderTotals(data: CreateOrderData) {
    const subtotal = await this.calculateSubtotal(data.items);
    const tax = subtotal * 0.08; // 8% tax
    const deliveryFee = await this.calculateDeliveryFee(data);
    const total = subtotal + tax + deliveryFee;

    return { subtotal, tax, deliveryFee, total };
  }

  private async createOrderRecord(orderData: any): Promise<Order> {
    // Database operation to create order
    // This would typically use your database client
    return {
      id: generateId(),
      ...orderData
    };
  }

  private async sendOrderNotifications(order: Order): Promise<void> {
    // Notify customer
    await notificationService.sendNotification({
      userId: order.customerId,
      type: 'order_confirmed',
      title: 'Order Confirmed',
      message: `Your order #${order.id} has been confirmed`,
      data: { orderId: order.id }
    });

    // Notify restaurant
    await notificationService.sendNotification({
      userId: order.restaurantId,
      type: 'new_order',
      title: 'New Order',
      message: `New order #${order.id} received`,
      data: { orderId: order.id }
    });
  }
}

export const orderService = new OrderService();
```

### Example 4: Utility Functions (`utils/auth-utils.ts`)
```typescript
import { cookies } from 'next/headers';
import { getAuth } from 'firebase-admin/auth';
import { User } from '../types/user';

export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('auth-token')?.value;
    
    if (!token) return null;

    const decodedToken = await getAuth().verifyIdToken(token);
    return await getUserFromToken(decodedToken);
  } catch {
    return null;
  }
}

export async function requireAuth(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Authentication required');
  }
  return user;
}

export function hasRole(user: User | null, roles: string[]): boolean {
  return user ? roles.includes(user.role) : false;
}

export function isAdmin(user: User | null): boolean {
  return hasRole(user, ['admin']);
}

export async function getUserFromToken(decodedToken: any): Promise<User> {
  // Get user from database using token info
  return {
    id: decodedToken.uid,
    email: decodedToken.email,
    name: decodedToken.name || decodedToken.email,
    role: decodedToken.role || 'customer',
    isActive: true,
    isVerified: decodedToken.email_verified,
    createdAt: new Date(decodedToken.auth_time * 1000),
    updatedAt: new Date()
  };
}
```

## 🔧 Advanced Patterns

### 1. Service Composition
```typescript
// services/order-fulfillment-service.ts
class OrderFulfillmentService {
  constructor(
    private orderService: OrderService,
    private inventoryService: InventoryService,
    private deliveryService: DeliveryService,
    private notificationService: NotificationService
  ) {}

  async fulfillOrder(orderId: string): Promise<ServiceResult<void>> {
    // Orchestrate multiple services
    const order = await this.orderService.getOrder(orderId);
    await this.inventoryService.reserveItems(order.items);
    await this.deliveryService.scheduleDelivery(order);
    await this.notificationService.notifyCustomer(order);
    
    return { success: true };
  }
}
```

### 2. Error Handling Pattern
```typescript
// utils/error-utils.ts
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function handleServiceError(error: unknown): ServiceResult<never> {
  if (error instanceof AppError) {
    return { success: false, error: error.message };
  }
  
  console.error('Unexpected error:', error);
  return { success: false, error: 'An unexpected error occurred' };
}
```

### 3. Caching Pattern
```typescript
// utils/cache-utils.ts
const cache = new Map<string, { data: any; expiry: number }>();

export function withCache<T>(
  key: string,
  fn: () => Promise<T>,
  ttl: number = 300000 // 5 minutes
): Promise<T> {
  const cached = cache.get(key);
  
  if (cached && Date.now() < cached.expiry) {
    return Promise.resolve(cached.data);
  }
  
  return fn().then(data => {
    cache.set(key, { data, expiry: Date.now() + ttl });
    return data;
  });
}
```

This comprehensive set of examples demonstrates how to implement the enterprise server architecture effectively across all applications in your monorepo.
