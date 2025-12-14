import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Package, Upload, DollarSign, List, PlusCircle, Truck, CheckCircle, CreditCard, Box, Search, X, AlertCircle, PackageCheck } from 'lucide-react';
import { Product, Order } from '../types';
import { ApiService } from '../services/api';

interface AdminProps {
  initialProducts: Product[];
  onRefreshProducts: () => void;
}

// Define action types for the modal
type ProcessAction = 'COMPLETE' | 'PAYMENT' | 'SHIPMENT' | 'DELIVERY';

interface ProcessingState {
    id: string;
    number: string;
    action: ProcessAction;
}

const Admin: React.FC<AdminProps> = ({ initialProducts, onRefreshProducts }) => {
  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products');
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  
  // New Product State
  const [newProduct, setNewProduct] = useState({ name: '', price: '', description: '' });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState('');

  // Modal State
  const [processingOrder, setProcessingOrder] = useState<ProcessingState | null>(null);

  useEffect(() => {
    setProducts(initialProducts);
  }, [initialProducts]);

  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrders();
    }
  }, [activeTab]);

  const fetchOrders = () => {
    setLoading(true);
    ApiService.getOrders().then(res => {
      setOrders(res);
      setLoading(false);
    });
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price) return;

    setUploadStatus('Processing...');
    
    try {
      let imageUrl = "https://via.placeholder.com/300";
      if (selectedFile) {
        imageUrl = await ApiService.uploadImage(selectedFile);
      }

      const prod = {
        name: newProduct.name,
        price: parseFloat(newProduct.price),
        currency: 'USD',
        imageUrl,
        sku: `SKU-${Date.now()}`,
        description: newProduct.description
      };

      await ApiService.createProduct(prod);
      setUploadStatus('Success!');
      setNewProduct({ name: '', price: '', description: '' });
      setSelectedFile(null);
      setTimeout(() => setUploadStatus(''), 2000);
      onRefreshProducts();
    } catch (err) {
      setUploadStatus('Failed');
    }
  };

  const handlePriceUpdate = async (productId: string, newPrice: string) => {
    if (!newPrice) return;
    try {
      await ApiService.updateProductPrice(productId, parseFloat(newPrice));
      alert(`Price updated to $${newPrice} (Simulated)`);
      // Update local state to reflect change immediately in UI
      setProducts(prev => prev.map(p => p.id === productId ? {...p, price: parseFloat(newPrice)} : p));
    } catch (err) {
      alert("Update failed");
    }
  };

  const handleConfirmProcess = async () => {
      if (!processingOrder) return;
      const { id, action } = processingOrder;
      
      // 1. Optimistic Update: Update local state immediately to prevent "glitches"
      setOrders(prevOrders => prevOrders.map(order => {
        if (order.id !== id) return order;

        if (action === 'COMPLETE') {
            return { ...order, status: 'Completed', paymentStatus: 'Paid', shipmentStatus: 'Delivered' };
        } else if (action === 'PAYMENT') {
            return { ...order, paymentStatus: 'Paid' };
        } else if (action === 'SHIPMENT') {
            return { ...order, shipmentStatus: 'Shipped' };
        } else if (action === 'DELIVERY') {
            return { ...order, shipmentStatus: 'Delivered' };
        }
        return order;
      }));

      // Close modal
      setProcessingOrder(null);
      
      try {
          let statusUpdate: 'Complete' | 'Paid' | 'Shipped' | 'Delivered' = 'Complete';
          if (action === 'PAYMENT') statusUpdate = 'Paid';
          if (action === 'SHIPMENT') statusUpdate = 'Shipped';
          if (action === 'DELIVERY') statusUpdate = 'Delivered';

          await ApiService.updateOrderStatus(id, statusUpdate);
          
          setTimeout(fetchOrders, 500); 
      } catch (err: any) {
          alert("Failed to update order: " + err.message);
          fetchOrders(); // Revert state on error
      }
  };

  // Helper to get modal content based on action
  const getModalContent = (action: ProcessAction) => {
      switch(action) {
          case 'PAYMENT':
              return {
                  title: 'Confirm Payment',
                  text: 'Mark this order as paid? This assumes you have received funds.',
                  icon: <DollarSign size={32} />,
                  button: 'Mark Paid'
              };
          case 'SHIPMENT':
              return {
                  title: 'Confirm Shipment',
                  text: 'Mark this order as shipped? This will notify the customer.',
                  icon: <Truck size={32} />,
                  button: 'Ship Order'
              };
          case 'DELIVERY':
              return {
                  title: 'Confirm Delivery',
                  text: 'Mark this order as delivered? This implies the customer has received it.',
                  icon: <PackageCheck size={32} />,
                  button: 'Mark Delivered'
              };
          default:
              return {
                  title: 'Complete Order',
                  text: 'Mark this order as fully completed? This will set payment to Paid and shipment to Delivered.',
                  icon: <CheckCircle size={32} />,
                  button: 'Complete Order'
              };
      }
  };

  const modalContent = processingOrder ? getModalContent(processingOrder.action) : null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 relative">
      
      {/* Custom Confirmation Modal - Wrapped in Portal to escape transform contexts */}
      {processingOrder && modalContent && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setProcessingOrder(null)}
          />
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 border border-gray-100 transform transition-all animate-fade-in-down scale-100">
            <button 
                onClick={() => setProcessingOrder(null)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
                <X size={20} />
            </button>
            
            <div className="flex flex-col items-center text-center">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-inner ${
                  processingOrder.action === 'PAYMENT' ? 'bg-emerald-100 text-emerald-600' : 
                  processingOrder.action === 'SHIPMENT' ? 'bg-blue-100 text-blue-600' : 
                  processingOrder.action === 'DELIVERY' ? 'bg-orange-100 text-orange-600' :
                  'bg-indigo-50 text-indigo-600'
                }`}>
                    {modalContent.icon}
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{modalContent.title}</h3>
                <p className="text-gray-500 mb-8 leading-relaxed">
                   {modalContent.text} <br/>
                   <span className="font-mono font-bold text-gray-800 bg-gray-100 px-2 py-0.5 rounded-md text-sm mt-2 inline-block">Order: {processingOrder.number}</span>
                </p>
                
                <div className="flex w-full gap-3">
                    <button 
                        onClick={() => setProcessingOrder(null)}
                        className="flex-1 px-6 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-all"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleConfirmProcess}
                        className={`flex-1 px-6 py-3.5 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 group ${
                            processingOrder.action === 'PAYMENT' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200' : 
                            processingOrder.action === 'SHIPMENT' ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-200' :
                            processingOrder.action === 'DELIVERY' ? 'bg-orange-500 hover:bg-orange-600 shadow-orange-200' :
                            'bg-gray-900 hover:bg-black shadow-gray-200'
                        }`}
                    >
                        <span>{modalContent.button}</span>
                        <CheckCircle size={18} className="group-hover:scale-110 transition-transform" />
                    </button>
                </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-4">
        <div>
           <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Admin Dashboard</h1>
           <p className="text-gray-500 mt-2">Overview of your store performance and inventory.</p>
        </div>
        <div className="flex bg-white p-1.5 rounded-xl border border-gray-200 shadow-sm">
          <button 
            onClick={() => setActiveTab('products')}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'products' ? 'bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-200' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}
          >
            Products
          </button>
          <button 
            onClick={() => setActiveTab('orders')}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'orders' ? 'bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-200' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}
          >
            Orders
          </button>
        </div>
      </div>

      {activeTab === 'products' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Create Product Form */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
              <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-gray-900">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                    <PlusCircle size={18} />
                </div>
                Add Product
              </h2>
              <form onSubmit={handleCreateProduct} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Product Name</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    placeholder="e.g. Wireless Headphones"
                    value={newProduct.name}
                    onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Price (USD)</label>
                  <div className="relative">
                      <span className="absolute left-4 top-3 text-gray-400 font-medium">$</span>
                      <input 
                        type="number" 
                        className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                        placeholder="0.00"
                        value={newProduct.price}
                        onChange={e => setNewProduct({...newProduct, price: e.target.value})}
                        required
                      />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Description</label>
                  <textarea 
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    rows={3}
                    placeholder="Product details..."
                    value={newProduct.description}
                    onChange={e => setNewProduct({...newProduct, description: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Product Image</label>
                  <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:bg-gray-50 hover:border-indigo-200 transition-all cursor-pointer relative group">
                    <input 
                      type="file" 
                      className="absolute inset-0 opacity-0 cursor-pointer z-10"
                      onChange={e => setSelectedFile(e.target.files ? e.target.files[0] : null)}
                    />
                    <div className="w-10 h-10 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                        <Upload size={20} />
                    </div>
                    <p className="text-sm font-medium text-gray-600">
                      {selectedFile ? selectedFile.name : 'Click to upload image'}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</p>
                  </div>
                </div>
                <button 
                  type="submit" 
                  className="w-full bg-gray-900 text-white py-3.5 rounded-xl font-bold hover:bg-black transition-colors shadow-lg shadow-gray-200"
                  disabled={uploadStatus === 'Processing...'}
                >
                  {uploadStatus || 'Create Product'}
                </button>
              </form>
            </div>
          </div>

          {/* Product List & Price Management */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
               <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                 <h2 className="font-bold text-gray-800 text-lg">Inventory</h2>
                 <span className="text-xs font-bold bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full">{products.length} Items</span>
               </div>
               <div className="divide-y divide-gray-50">
                  {products.map(product => (
                    <div key={product.id} className="p-5 flex items-center gap-5 hover:bg-gray-50 transition-colors">
                       <div className="w-16 h-16 bg-white border border-gray-200 rounded-lg p-2 flex-shrink-0">
                          <img src={product.imageUrl} alt="" className="w-full h-full object-contain" />
                       </div>
                       <div className="flex-grow">
                          <h4 className="font-bold text-gray-900 text-sm">{product.name}</h4>
                          <span className="text-xs text-gray-400 font-mono mt-1 block">{product.sku}</span>
                       </div>
                       <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-lg border border-gray-100">
                          <span className="text-sm font-bold text-gray-700 ml-1">${product.price.toFixed(2)}</span>
                          <div className="h-4 w-px bg-gray-300"></div>
                          <form 
                            onSubmit={(e) => {
                              e.preventDefault();
                              const input = (e.currentTarget.elements[0] as HTMLInputElement);
                              handlePriceUpdate(product.id, input.value);
                              input.value = '';
                            }}
                            className="flex items-center gap-2"
                          >
                             <input 
                                 type="number" 
                                 placeholder="New Price" 
                                 step="0.01"
                                 className="w-24 px-2 py-1 bg-white border border-gray-200 rounded text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                               />
                             <button type="submit" className="bg-indigo-600 text-white p-1.5 rounded hover:bg-indigo-700 transition-colors">
                               <CheckCircle size={14} />
                             </button>
                          </form>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        </div>
      ) : (
        /* Orders Tab */
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
           <div className="overflow-x-auto">
             <table className="w-full text-left">
               <thead className="bg-gray-50 border-b border-gray-200">
                 <tr>
                   <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Order</th>
                   <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                   <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Total</th>
                   <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Payment</th>
                   <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Shipment</th>
                   <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                   <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-gray-100">
                 {loading ? (
                   <tr><td colSpan={7} className="text-center py-12 text-gray-500">Loading orders...</td></tr>
                 ) : orders.length === 0 ? (
                    <tr><td colSpan={7} className="text-center py-12 text-gray-500">No orders found.</td></tr>
                 ) : orders.map(order => {
                   const isCompleted = order.status === 'Completed';
                   
                   return (
                   <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                     <td className="px-6 py-4">
                        <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded border border-indigo-100">
                            {order.orderNumber}
                        </span>
                     </td>
                     <td className="px-6 py-4 text-sm font-medium text-gray-600">{order.date}</td>
                     <td className="px-6 py-4 text-sm font-bold text-gray-900">${order.total.toFixed(2)}</td>
                     <td className="px-6 py-4">
                        {/* Interactive Payment Badge */}
                        <button
                          onClick={() => !isCompleted && order.paymentStatus !== 'Paid' && setProcessingOrder({ id: order.id, number: order.orderNumber, action: 'PAYMENT' })}
                          disabled={order.paymentStatus === 'Paid' || isCompleted}
                          className={`px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 transition-all ${
                            order.paymentStatus === 'Paid' 
                            ? 'bg-emerald-100 text-emerald-700 cursor-default opacity-90' 
                            : isCompleted 
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-60' 
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900 cursor-pointer hover:shadow-sm active:scale-95'
                          }`}
                        >
                          {order.paymentStatus === 'Paid' ? <CheckCircle size={12} /> : <div className="w-2 h-2 rounded-full bg-gray-400"></div>}
                          {order.paymentStatus}
                        </button>
                     </td>
                     <td className="px-6 py-4">
                       {/* Interactive Shipment Badge (Pending -> Shipped -> Delivered) */}
                       <button
                          onClick={() => {
                            if (isCompleted) return;
                            if (order.shipmentStatus !== 'Delivered') {
                                // If Pending -> Mark Shipped. If Shipped -> Mark Delivered.
                                const nextAction = order.shipmentStatus === 'Shipped' ? 'DELIVERY' : 'SHIPMENT';
                                setProcessingOrder({ id: order.id, number: order.orderNumber, action: nextAction });
                            }
                          }}
                          disabled={order.shipmentStatus === 'Delivered' || isCompleted}
                          className={`px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 transition-all ${
                            order.shipmentStatus === 'Delivered'
                            ? 'bg-green-100 text-green-700 cursor-default opacity-90'
                            : order.shipmentStatus === 'Shipped' 
                                ? isCompleted ? 'bg-blue-100 text-blue-700 opacity-60' : 'bg-blue-100 text-blue-700 hover:bg-blue-200 cursor-pointer hover:shadow-sm active:scale-95'
                                : isCompleted 
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-60'
                                    : 'bg-orange-100 text-orange-700 hover:bg-orange-200 hover:text-orange-900 cursor-pointer hover:shadow-sm active:scale-95'
                          }`}
                        >
                         {order.shipmentStatus === 'Delivered' ? <PackageCheck size={12} /> : order.shipmentStatus === 'Shipped' ? <Truck size={12} /> : <div className="w-2 h-2 rounded-full bg-orange-400"></div>}
                         {order.shipmentStatus}
                       </button>
                     </td>
                     <td className="px-6 py-4">
                        <span className={`text-xs font-bold ${isCompleted ? 'text-green-600' : 'text-yellow-600'}`}>
                            {order.status}
                        </span>
                     </td>
                     <td className="px-6 py-4 text-right">
                        {!isCompleted ? (
                            <button 
                                onClick={() => setProcessingOrder({ id: order.id, number: order.orderNumber, action: 'COMPLETE' })}
                                className="text-xs bg-gray-900 hover:bg-black text-white px-4 py-2 rounded-lg font-bold inline-flex items-center gap-2 transition-all shadow-sm transform active:scale-95"
                            >
                                <CheckCircle size={14} /> Complete
                            </button>
                        ) : (
                            <span className="text-xs font-medium text-gray-400 italic px-2">Archived</span>
                        )}
                     </td>
                   </tr>
                 )})}
               </tbody>
             </table>
           </div>
        </div>
      )}
    </div>
  );
};

export default Admin;