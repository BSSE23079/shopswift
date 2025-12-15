import React, { useState, useEffect } from 'react';
import { ApiService } from '../services/api';
import { AuthData, User } from '../types';
import { ShieldCheck, User as UserIcon, ArrowRight, Sparkles } from 'lucide-react';

interface AuthProps {
  onLogin: (user: User) => void;
  onSwitchMode: () => void;
  isSignup?: boolean;
}

const Auth: React.FC<AuthProps> = ({ onLogin, onSwitchMode, isSignup = false }) => {
  const [formData, setFormData] = useState<AuthData>({ email: '', password: '', firstName: '', lastName: '', isAdmin: false });
  const [loading, setLoading] = useState(false);
  const [userType, setUserType] = useState<'customer' | 'admin'>('customer');

  // Reset form when switching modes, but keep userType logic flexible
  useEffect(() => {
    setFormData(prev => ({ 
        ...prev, 
        email: '', 
        password: '', 
        firstName: '', 
        lastName: '',
        isAdmin: userType === 'admin'
    }));
  }, [isSignup, userType]);

  const handleUserTypeChange = (type: 'customer' | 'admin') => {
    setUserType(type);
    
    // Reset form data when switching types to avoid confusion
    setFormData({ ...formData, email: '', password: '', isAdmin: type === 'admin' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let user;
      const payload = { ...formData, isAdmin: userType === 'admin' };
      
      if (isSignup) {
        user = await ApiService.signup(payload);
      } else {
        user = await ApiService.login(payload);
      }
      onLogin(user);
    } catch (err) {
      alert("Authentication failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-300/30 rounded-full blur-3xl"></div>
      </div>

      <div className="bg-white/80 backdrop-blur-2xl p-8 md:p-10 rounded-3xl shadow-2xl w-full max-w-md border border-white/50 relative z-10">
        
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-xl mx-auto mb-4 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
              <Sparkles size={24} fill="currentColor" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">
            {isSignup ? (userType === 'admin' ? 'Admin Registration' : 'Create Account') : (userType === 'admin' ? 'Admin Portal' : 'Welcome Back')}
          </h1>
          <p className="text-gray-500">
            {isSignup 
              ? (userType === 'admin' ? 'Register a new store manager' : 'Start your shopping journey today')
              : (userType === 'admin' ? 'Secure access for store managers' : 'Enter your details to access your account')}
          </p>
        </div>

        {/* Role Toggle - Now available in both Login and Signup */}
        <div className="grid grid-cols-2 gap-2 mb-8 p-1.5 bg-gray-100/80 rounded-2xl border border-gray-200/50">
             <button
               type="button"
               onClick={() => handleUserTypeChange('customer')}
               className={`flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-xl transition-all ${
                 userType === 'customer' 
                 ? 'bg-white text-gray-900 shadow-sm ring-1 ring-black/5' 
                 : 'text-gray-500 hover:text-gray-900'
               }`}
             >
               <UserIcon size={18} /> Customer
             </button>
             <button
               type="button"
               onClick={() => handleUserTypeChange('admin')}
               className={`flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-xl transition-all ${
                 userType === 'admin' 
                 ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-black/5' 
                 : 'text-gray-500 hover:text-gray-900'
               }`}
             >
               <ShieldCheck size={18} /> Admin
             </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {isSignup && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                  <input
                    type="text"
                    placeholder="First Name"
                    required
                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all placeholder:text-gray-400 font-medium"
                    value={formData.firstName}
                    onChange={e => setFormData({...formData, firstName: e.target.value})}
                  />
              </div>
              <div>
                  <input
                    type="text"
                    placeholder="Last Name"
                    required
                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all placeholder:text-gray-400 font-medium"
                    value={formData.lastName}
                    onChange={e => setFormData({...formData, lastName: e.target.value})}
                  />
              </div>
            </div>
          )}
          
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase ml-1 tracking-wider">Email Address</label>
            <input
              type="email"
              placeholder="name@example.com"
              required
              className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all placeholder:text-gray-400 font-medium"
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
            />
          </div>
          
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase ml-1 tracking-wider">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              required
              className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all placeholder:text-gray-400 font-medium"
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full font-bold py-4 rounded-xl transition-all shadow-xl flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-wait mt-4 ${
                userType === 'admin'
                ? 'bg-gray-900 hover:bg-black text-white shadow-gray-200' 
                : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-indigo-200'
            }`}
          >
            {loading ? 'Processing...' : (
                <>
                {isSignup ? (userType === 'admin' ? 'Create Admin Account' : 'Create Account') : (userType === 'admin' ? 'Access Dashboard' : 'Sign In')}
                {!loading && <ArrowRight size={18} />}
                </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center pt-6 border-t border-gray-100">
        <button 
            onClick={onSwitchMode}
            className="text-indigo-600 hover:text-indigo-800 text-sm font-bold hover:underline transition-all"
        >
            {isSignup ? 'Already have an account? Log in' : "Don't have an account? Create one"}
        </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;