
import { useState, useEffect, createContext, useContext } from 'react';

const ToastContext = createContext({
  toasts: [],
  toast: () => {},
  dismiss: () => {},
});

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const toast = (opts = {}) => {
    const id = Math.random().toString(36).substring(2, 9);
    const toast = {
      id,
      title: opts.title,
      description: opts.description,
      action: opts.action,
      variant: opts.variant,
      duration: opts.duration || 5000,
    };

    setToasts((prevToasts) => [...prevToasts, toast]);
    return id;
  };

  const dismiss = (id) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Helper function to directly create toast
export const toast = (opts = {}) => {
  const { toast } = useToast();
  return toast(opts);
};
