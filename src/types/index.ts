export interface User {
  username: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
}

export interface Product {
  id: string;
  name: string;
  location: string;
  quantity: number;
  cost: number;
  salePrice: number;
  createdAt: string;
  updatedAt: string;
}

export interface Client {
  id: string;
  name: string;
  contact: string;
  shippingLocation: string;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  clientId: string;
  clientName: string;
  products: OrderProduct[];
  total: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface OrderProduct {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Statistics {
  totalProducts: number;
  totalClients: number;
  totalOrders: number;
  lowStockProducts: number;
  monthlyRevenue: number;
  monthlyOrders: number;
}

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  duration?: number;
}
