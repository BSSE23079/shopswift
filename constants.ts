import { Product, Order } from './types';

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'p-1',
    name: 'Premium Wireless Headphones',
    price: 199.99,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
    sku: 'SKU-AUDIO-001',
    description: 'High fidelity sound with noise cancellation.'
  },
  {
    id: 'p-2',
    name: 'Smart Fitness Watch',
    price: 149.50,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
    sku: 'SKU-WEAR-002',
    description: 'Track your health metrics in real-time.'
  },
  {
    id: 'p-3',
    name: 'Ergonomic Office Chair',
    price: 250.00,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?auto=format&fit=crop&w=600&q=80',
    sku: 'SKU-FURN-003',
    description: 'Comfortable support for long working hours.'
  },
  {
    id: 'p-4',
    name: 'Mechanical Keyboard',
    price: 120.00,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b91add1?auto=format&fit=crop&w=600&q=80',
    sku: 'SKU-TECH-004',
    description: 'Tactile switches for the ultimate typing experience.'
  }
];

export const MOCK_ORDERS: Order[] = [
  {
    id: 'ord-123',
    orderNumber: 'ORD-885921',
    total: 349.99,
    items: 2,
    status: 'Completed',
    date: '2023-10-15'
  },
  {
    id: 'ord-124',
    orderNumber: 'ORD-112344',
    total: 199.99,
    items: 1,
    status: 'Pending',
    date: '2023-10-16'
  }
];