import React, { useState } from 'react';
import { ArrowLeft, CheckCircle, CreditCard, Lock } from 'lucide-react';
import { User, CartItem } from '../types';
import { ApiService } from '../services/api';

interface CheckoutProps {
  user: User | null;
  cart: CartItem[];
  onBack: () => void;
  onSuccess: () => void;
}

const Checkout: React.FC<CheckoutProps> = ({ user, cart, onBack, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    address: '123 Default Street',
    city: 'New York',
    zip: '10001'
  });

  const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0) * 1.08;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Simulate API call to place order
      await ApiService.placeOrder(cart, user, formData);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6"
      >
        <ArrowLeft size={18} /> Back to Cart
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Form Section */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Lock size={20} className="text-indigo-600" />
            Secure Checkout
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
              <input
                type="text"
                name="address"
                required
                value={formData.address}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  name="city"
                  required
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Zip Code</label>
                <input
                  type="text"
                  name="zip"
                  required
                  value={formData.zip}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                />
              </div>
            </div>

            {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <>
                  Confirm & Pay ${total.toFixed(2)}
                </>
              )}
            </button>
          </form>
        </div>

        {/* Review Section */}
        <div className="space-y-6">
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
             <h3 className="font-bold text-gray-900 mb-4">Order Review</h3>
             <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
                {cart.map(item => (
                  <div key={item.id} className="flex justify-between items-center text-sm">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded border border-gray-200 flex items-center justify-center">
                            <img src={item.imageUrl} alt="" className="max-w-full max-h-full" />
                        </div>
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-gray-500">Qty: {item.quantity}</p>
                        </div>
                     </div>
                     <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
             </div>
             <div className="border-t border-gray-200 mt-4 pt-4 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
             </div>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex gap-3">
            <CreditCard className="text-blue-600 flex-shrink-0" />
            <p className="text-sm text-blue-800">
              This is a demo checkout. No actual payment will be processed, but the order simulation mimics a real Commercetools transaction.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
