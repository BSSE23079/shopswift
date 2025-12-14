import React, { useEffect } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-24 right-4 z-[100] animate-fade-in-down">
      <div className={`flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl border ${
        type === 'success' ? 'bg-white border-green-100' : 'bg-white border-red-100'
      }`}>
        {type === 'success' ? (
          <CheckCircle className="text-green-500" size={24} />
        ) : (
          <XCircle className="text-red-500" size={24} />
        )}
        <div className="flex flex-col">
          <h4 className={`font-bold text-sm ${type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
            {type === 'success' ? 'Success' : 'Error'}
          </h4>
          <p className="text-sm text-gray-600">{message}</p>
        </div>
        <button onClick={onClose} className="ml-4 text-gray-400 hover:text-gray-600">
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default Toast;