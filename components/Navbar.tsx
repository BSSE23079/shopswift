import React from 'react';
import { ShoppingCart, LogOut, Package, ShieldCheck, Zap } from 'lucide-react';
import { User as UserType, ViewState } from '../types';

interface NavbarProps {
  user: UserType | null;
  cartCount: number;
  activeTab: ViewState;
  onNavigate: (tab: ViewState) => void;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, cartCount, activeTab, onNavigate, onLogout }) => {
  return (
    <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-white/20 shadow-sm transition-all supports-[backdrop-filter]:bg-white/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          {/* Logo */}
          <div className="flex items-center cursor-pointer group" onClick={() => onNavigate('shop')}>
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-xl mr-3 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 group-hover:rotate-6 transition-all duration-300">
              <Zap fill="currentColor" size={20} className="drop-shadow-sm" />
            </div>
            <span className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700 tracking-tight group-hover:from-indigo-600 group-hover:to-purple-600 transition-all duration-300">
              ShopSwift
            </span>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center gap-4">
            {!user ? (
              <button 
                onClick={() => onNavigate('login')}
                className="bg-gray-900 hover:bg-black text-white font-semibold px-6 py-2.5 rounded-full transition-all shadow-lg hover:shadow-gray-900/20 active:scale-95 transform duration-200"
              >
                Sign In
              </button>
            ) : (
              <>
                <div className="hidden md:flex items-center bg-gray-100/80 p-1.5 rounded-full border border-gray-200/50 mr-2">
                  <button
                    onClick={() => onNavigate('shop')}
                    className={`flex items-center gap-2 px-5 py-2 rounded-full transition-all text-sm font-semibold ${
                      activeTab === 'shop' 
                      ? 'bg-white text-indigo-600 shadow-md shadow-gray-200/50' 
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'
                    }`}
                  >
                    <Package size={16} />
                    Shop
                  </button>

                  {user.isAdmin && (
                    <button
                      onClick={() => onNavigate('admin')}
                      className={`flex items-center gap-2 px-5 py-2 rounded-full transition-all text-sm font-semibold ${
                        activeTab === 'admin' 
                        ? 'bg-white text-indigo-600 shadow-md shadow-gray-200/50' 
                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'
                      }`}
                    >
                      <ShieldCheck size={16} />
                      Admin
                    </button>
                  )}
                </div>

                <button
                  onClick={() => onNavigate('cart')}
                  className="relative p-3 rounded-full hover:bg-indigo-50 transition-colors group"
                >
                  <ShoppingCart size={24} className={`transition-colors duration-300 ${activeTab === 'cart' ? 'text-indigo-600 fill-indigo-600' : 'text-gray-600 group-hover:text-indigo-600'}`} />
                  {cartCount > 0 && (
                    <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center border-2 border-white shadow-sm transform scale-100 animate-fade-in">
                      {cartCount}
                    </span>
                  )}
                </button>

                <div className="h-8 w-px bg-gray-200 mx-2 hidden sm:block"></div>

                <div className="flex items-center gap-3 pl-2 group relative">
                  <div className="hidden md:flex flex-col items-end cursor-default">
                    <span className="text-sm font-bold text-gray-800 leading-none">{user.firstName}</span>
                    <span className={`text-[10px] uppercase tracking-wider font-bold mt-1 ${user.isAdmin ? 'text-indigo-600' : 'text-gray-400'}`}>
                      {user.isAdmin ? 'Admin Access' : 'Customer'}
                    </span>
                  </div>
                  <button
                    onClick={onLogout}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                    title="Logout"
                  >
                    <LogOut size={20} />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;