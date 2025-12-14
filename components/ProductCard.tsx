import React from 'react';
import { Plus, ShoppingBag } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  return (
    <div className="group relative bg-white rounded-3xl transition-all duration-300 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] hover:-translate-y-2 overflow-hidden flex flex-col h-full border border-gray-100">
      {/* Image Area */}
      <div className="relative h-64 p-8 bg-gradient-to-b from-gray-50 to-white flex items-center justify-center overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl -mr-10 -mt-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        
        <img 
          src={product.imageUrl} 
          alt={product.name} 
          className="max-h-full max-w-full object-contain mix-blend-multiply z-10 group-hover:scale-110 transition-transform duration-500 ease-out" 
        />
        
        <button
          onClick={() => onAddToCart(product)}
          className="absolute bottom-4 right-4 w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hover:bg-indigo-700 active:scale-95 z-20"
          aria-label="Add to cart"
        >
          <Plus size={24} />
        </button>
      </div>
      
      {/* Content Area */}
      <div className="p-6 flex flex-col flex-grow relative bg-white">
        <div className="mb-2">
          <div className="flex justify-between items-start mb-2">
            <span className="inline-block px-2.5 py-1 bg-gray-100 text-gray-500 text-[10px] font-extrabold uppercase tracking-widest rounded-md">
                {product.sku.split('-')[1] || 'ITEM'}
            </span>
          </div>
          <h3 className="text-lg font-bold text-gray-900 leading-tight group-hover:text-indigo-600 transition-colors cursor-pointer">
            {product.name}
          </h3>
        </div>
        
        {product.description && (
          <p className="text-sm text-gray-500 mb-6 line-clamp-2 leading-relaxed font-medium">
            {product.description}
          </p>
        )}
        
        <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider block mb-0.5">Price</span>
            <span className="text-xl font-bold text-gray-900">
              ${product.price.toFixed(2)}
            </span>
          </div>
          <button 
             onClick={() => onAddToCart(product)}
             className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1"
          >
             Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;