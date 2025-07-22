import React, { useEffect } from 'react';

const Toast = ({ message, type = 'success', duration = 4000, onClose }) => {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [message, duration, onClose]);

  if (!message) return null;

  const baseStyle = "fixed top-5 right-5 p-4 rounded-md shadow-lg text-white transition-all duration-500 ease-in-out z-[100]";
  const typeStyles = {
    success: "bg-green-600",
    error: "bg-red-600",
    info: "bg-blue-600",
  };

  return (
    <div className={`${baseStyle} ${typeStyles[type] || typeStyles.info} animate-toast-in-out`}>
      <span>{message}</span>
      <button 
        onClick={onClose} 
        className="ml-3 text-xl font-semibold leading-none hover:text-gray-200"
        aria-label="Close toast"
      >
        &times;
      </button>
      <style jsx global>{`
        @keyframes toast-in-out {
          0% { transform: translateX(100%); opacity: 0; }
          15% { transform: translateX(0); opacity: 1; }
          85% { transform: translateX(0); opacity: 1; }
          100% { transform: translateX(100%); opacity: 0; }
        }
        .animate-toast-in-out {
          animation: toast-in-out ${duration / 1000}s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Toast;
