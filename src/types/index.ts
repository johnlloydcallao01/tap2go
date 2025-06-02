export interface User {
  id: string;
  email: string;
  name?: string;
  role: 'customer' | 'vendor' | 'driver' | 'admin';
  phone?: string;
  address?: Address;
  profileImage?: string;
  isActive: boolean;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface VendorProfile extends User {
  role: 'vendor';
  businessName: string;
  businessLicense: string;
  taxId: string;
  bankAccount: BankAccount;
  commissionRate: number;
  totalEarnings: number;
  status: 'pending' | 'approved' | 'suspended' | 'rejected';
  documents: VendorDocument[];
}

// Driver interface removed - not implemented yet

export interface BankAccount {
  accountNumber: string;
  routingNumber: string;
  accountHolderName: string;
  bankName: string;
}

export interface VendorDocument {
  id: string;
  type: 'business_license' | 'tax_certificate' | 'food_permit' | 'insurance';
  url: string;
  status: 'pending' | 'approved' | 'rejected';
  uploadedAt: Date;
}

export interface DriverEarnings {
  today: number;
  thisWeek: number;
  thisMonth: number;
  total: number;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface Restaurant {
  id: string;
  name: string;
  description: string;
  image: string;
  coverImage?: string;
  cuisine: string[];
  address: Address;
  phone: string;
  email: string;
  ownerId: string;
  rating: number;
  reviewCount: number;
  deliveryTime: string;
  deliveryFee: number;
  deliveryRadius?: number; // Delivery radius in kilometers
  minimumOrder: number;
  isOpen: boolean;
  openingHours: OpeningHours;
  featured: boolean;
  status: 'pending' | 'approved' | 'active' | 'inactive' | 'suspended';
  commissionRate: number;
  totalOrders: number;
  totalRevenue: number;
  averagePreparationTime: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface OpeningHours {
  monday: DayHours;
  tuesday: DayHours;
  wednesday: DayHours;
  thursday: DayHours;
  friday: DayHours;
  saturday: DayHours;
  sunday: DayHours;
}

export interface DayHours {
  open: string;
  close: string;
  isClosed: boolean;
}

export interface MenuItem {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  isSpicy: boolean;
  ingredients: string[];
  allergens: string[];
  available: boolean;
  preparationTime: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CartItem {
  id: string;
  menuItem: MenuItem;
  quantity: number;
  specialInstructions?: string;
  totalPrice: number;
}

export interface Cart {
  items: CartItem[];
  restaurantId: string;
  subtotal: number;
  deliveryFee: number;
  tax: number;
  total: number;
}

export interface Order {
  id: string;
  customerId: string;
  restaurantId: string;
  driverId?: string;
  items: CartItem[];
  status: OrderStatus;
  subtotal: number;
  deliveryFee: number;
  tax: number;
  platformFee: number;
  vendorEarnings: number;
  driverEarnings: number;
  total: number;
  deliveryAddress: Address;
  restaurantAddress: Address;
  paymentMethod: PaymentMethod;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  specialInstructions?: string;
  estimatedDeliveryTime: Date;
  actualDeliveryTime?: Date;
  preparationTime?: number;
  pickupTime?: Date;
  deliveryStartTime?: Date;
  orderNumber: string;
  trackingUpdates: OrderTracking[];
  createdAt: Date;
  updatedAt: Date;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'driver_assigned'
  | 'picked_up'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export interface OrderTracking {
  id: string;
  orderId: string;
  status: OrderStatus;
  message: string;
  timestamp: Date;
  location?: {
    lat: number;
    lng: number;
  };
  updatedBy: string;
  updatedByRole: User['role'];
}

export interface VendorAnalytics {
  restaurantId: string;
  period: 'today' | 'week' | 'month' | 'year';
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  topSellingItems: {
    itemId: string;
    itemName: string;
    quantity: number;
    revenue: number;
  }[];
  ordersByStatus: {
    [key in OrderStatus]: number;
  };
  revenueByDay: {
    date: string;
    revenue: number;
    orders: number;
  }[];
  customerRatings: {
    average: number;
    total: number;
    breakdown: {
      [key: number]: number;
    };
  };
}

export interface DriverAnalytics {
  driverId: string;
  period: 'today' | 'week' | 'month' | 'year';
  totalDeliveries: number;
  totalEarnings: number;
  averageDeliveryTime: number;
  rating: number;
  totalRatings: number;
  onlineHours: number;
  deliveriesByStatus: {
    completed: number;
    cancelled: number;
  };
  earningsByDay: {
    date: string;
    earnings: number;
    deliveries: number;
  }[];
}

export interface Notification {
  id: string;
  userId: string;
  userRole: User['role'];
  type: 'order' | 'payment' | 'system' | 'promotion';
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  createdAt: Date;
}

export interface PaymentMethod {
  type: 'card' | 'cash' | 'digital_wallet';
  cardLast4?: string;
  cardBrand?: string;
}

export interface Review {
  id: string;
  customerId: string;
  restaurantId: string;
  orderId: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

export interface Category {
  id: string;
  name: string;
  image: string;
  description: string;
  featured: boolean;
}

export interface SearchFilters {
  cuisine?: string[];
  priceRange?: {
    min: number;
    max: number;
  };
  rating?: number;
  deliveryTime?: number;
  isVegetarian?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, role: User['role']) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  authError?: string | null;
  isInitialized?: boolean;
}

export interface CartContextType {
  cart: Cart | null;
  addToCart: (item: MenuItem, quantity: number, specialInstructions?: string) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
}
