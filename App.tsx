import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import ProductCard from "./components/ProductCard";
import Cart from "./components/Cart";
import Checkout from "./components/Checkout";
import Admin from "./components/Admin";
import Auth from "./components/Auth";
import Toast from "./components/Toast";
import { ApiService } from "./services/api";
import { Product, CartItem, User, ViewState } from "./types";
import { ShoppingBag, ArrowRight, ShieldCheck } from "lucide-react";

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<ViewState>("login");
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Notification State
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Initial Load
  useEffect(() => {
    loadProducts();
  }, []);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
  };

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await ApiService.getProducts();
      setProducts(data);
    } catch (e: any) {
      console.error(e);
      showToast("Failed to load products: " + e.message, "error");
    } finally {
      setLoading(false);
    }
  };

  // Cart Actions
  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        showToast(`Updated quantity for ${product.name}`, "success");
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      showToast(`Added ${product.name} to cart`, "success");
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, change: number) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.id === productId) {
            return { ...item, quantity: item.quantity + change };
          }
          return item;
        })
        .filter((item) => item.quantity > 0);
    });
  };

  // Auth Actions
  const handleLogin = (userData: User) => {
    setUser(userData);
    showToast(`Welcome back, ${userData.firstName}!`, "success");
    if (userData.isAdmin) {
      setView("admin");
    } else {
      setView("shop");
    }
  };

  const handleLogout = () => {
    setUser(null);
    setCart([]);
    setView("login");
    showToast("Logged out successfully", "success");
  };

  // Render Logic
  const renderContent = () => {
    if (loading && view === "shop") {
      return (
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="h-64 w-full bg-gray-100 rounded-3xl animate-pulse mb-12"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="bg-white rounded-3xl h-96 border border-gray-100 p-6"
              >
                <div className="h-48 bg-gray-100 rounded-2xl animate-pulse mb-6"></div>
                <div className="h-4 w-20 bg-gray-100 rounded mb-3 animate-pulse"></div>
                <div className="h-6 w-3/4 bg-gray-100 rounded mb-4 animate-pulse"></div>
                <div className="mt-auto h-10 w-full bg-gray-100 rounded-xl animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    switch (view) {
      case "login":
        return (
          <Auth
            onLogin={handleLogin}
            onSwitchMode={() => setView("signup")}
            isSignup={false}
          />
        );
      case "signup":
        return (
          <Auth
            onLogin={handleLogin}
            onSwitchMode={() => setView("login")}
            isSignup={true}
          />
        );
      case "shop":
        return (
          <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Hero Section */}
            <div className="mb-12 rounded-[2.5rem] bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 p-8 md:p-16 text-white shadow-2xl shadow-indigo-200 overflow-hidden relative group">
              <div className="relative z-10 max-w-2xl">
                <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-indigo-50 font-semibold text-sm mb-6">
                  ✨ New Collection 2024
                </span>
                <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight tracking-tight">
                  Upgrade Your Lifestyle
                  <br />
                  With{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 to-white">
                    ShopSwift
                  </span>
                </h1>
                <p className="text-indigo-100 text-lg md:text-xl mb-8 max-w-lg leading-relaxed">
                  Discover premium gadgets, furniture, and accessories curated
                  just for you. Fast shipping, secure checkout.
                </p>
                <button className="bg-white text-indigo-600 px-8 py-4 rounded-full font-bold shadow-xl hover:bg-indigo-50 hover:scale-105 transition-all flex items-center gap-2 group-hover:gap-4">
                  Browse Collection <ArrowRight size={20} />
                </button>
              </div>

              {/* Abstract Decorative Shapes */}
              <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[30rem] h-[30rem] bg-white/10 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute bottom-0 right-20 w-80 h-80 bg-purple-400/20 rounded-full blur-3xl"></div>
              <div className="absolute top-1/2 left-1/3 w-20 h-20 bg-pink-400/20 rounded-full blur-xl"></div>
            </div>

            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                <ShoppingBag className="text-indigo-600" /> Trending Products
              </h2>
              <button className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">
                View All
              </button>
            </div>

            {products.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingBag size={32} className="text-gray-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  No products found
                </h3>
                <p className="text-gray-500 mt-2 max-w-md mx-auto">
                  It seems your Commercetools project is empty.
                  {user?.isAdmin && (
                    <span className="block mt-2 text-indigo-600 font-medium">
                      Go to Admin Dashboard to add products.
                    </span>
                  )}
                </p>
                {user?.isAdmin && (
                  <button
                    onClick={() => setView("admin")}
                    className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors"
                  >
                    Go to Admin
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} onAddToCart={addToCart} />
                ))}
              </div>
            )}
          </div>
        );
      case "cart":
        return (
          <Cart
            cart={cart}
            onUpdateQuantity={updateQuantity}
            onCheckout={() => setView("checkout")}
          />
        );
      case "checkout":
        return (
          <Checkout
            user={user}
            cart={cart}
            onBack={() => setView("cart")}
            onSuccess={() => {
              setCart([]);
              showToast("Order Placed Successfully!", "success");
              setView("shop");
            }}
          />
        );
      case "admin":
        return user?.isAdmin ? (
          <Admin initialProducts={products} onRefreshProducts={loadProducts} />
        ) : (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <ShieldCheck size={32} className="text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Access Denied</h2>
            <p className="text-gray-500 mt-2">
              You do not have permission to view this page.
            </p>
            <button
              onClick={() => setView("shop")}
              className="mt-6 text-indigo-600 font-medium hover:underline"
            >
              Return to Shop
            </button>
          </div>
        );
      default:
        return <div>Not found</div>;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-20 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <Navbar
        user={user}
        cartCount={cart.reduce((a, b) => a + b.quantity, 0)}
        activeTab={view}
        onNavigate={setView}
        onLogout={handleLogout}
      />
      <main className="animate-fade-in pt-4">{renderContent()}</main>
    </div>
  );
}

export default App;
