export interface Product {
  id: string;
  name: string;
  price: number;
  currency: string;
  imageUrl: string;
  sku: string;
  description?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isAdmin: boolean;
}

export interface Order {
  id: string;
  orderNumber: string;
  total: number;
  items: number;
  status: 'Pending' | 'Completed';
  paymentStatus: string;
  shipmentStatus: string;
  date: string;
}

export type ViewState = 'login' | 'signup' | 'shop' | 'cart' | 'checkout' | 'admin';

export interface AuthData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  isAdmin?: boolean;
}