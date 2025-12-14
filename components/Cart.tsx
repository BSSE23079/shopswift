import React from 'react';
import { Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { CartItem } from '../types';

interface CartProps {
  cart: CartItem[];
  onUpdateQuantity: (id: string, change: number) => void;
  onCheckout: () => void;
}

const Cart: React.FC<CartProps> = ({ cart, onUpdateQuantity, onCheckout }) => {
  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const tax = subtotal * 0.08; // 8% tax example
  const total = subtotal + tax;

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <div className="bg-gray-100 p-6 rounded-full mb-6">
          <ShoppingBag size={48} className="text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-8 text-center max-w-md">
          Looks like you haven't added anything to your cart yet. Explore our products to find something you love.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
        <ShoppingBag className="text-indigo-600" />
        Your Cart
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => (
            <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4 items-center">
              <div className="w-24 h-24 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0 p-2">
                <img src={item.imageUrl} alt={item.name} className="max-h-full max-w-full object-contain mix-blend-multiply" />
              </div>
              
              <div className="flex-grow">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-900">{item.name}</h3>
                    <p className="text-sm text-gray-500">{item.sku}</p>
                  </div>
                  <p className="font-bold text-indigo-600">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
                
                <div className="flex justify-between items-center mt-4">
                  <div className="flex items-center bg-gray-100 rounded-lg p-1">
                    <button 
                      onClick={() => onUpdateQuantity(item.id, -1)}
                      className="w-8 h-8 flex items-center justify-center rounded-md bg-white text-gray-600 shadow-sm hover:text-red-500 disabled:opacity-50"
                    >
                      {item.quantity === 1 ? <Trash2 size={14} /> : '-'}
                    </button>
                    <span className="w-10 text-center font-medium text-sm">{item.quantity}</span>
                    <button 
                      onClick={() => onUpdateQuantity(item.id, 1)}
                      className="w-8 h-8 flex items-center justify-center rounded-md bg-white text-gray-600 shadow-sm hover:text-indigo-600"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
            <h3 className="text-lg font-bold mb-4">Order Summary</h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax (8%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="border-t pt-3 mt-3 flex justify-between font-bold text-lg text-gray-900">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={onCheckout}
              className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-indigo-200"
            >
              Checkout <ArrowRight size={18} />
            </button>
            <p className="text-xs text-gray-400 text-center mt-4">
              Secure checkout powered by ShopSwift
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
