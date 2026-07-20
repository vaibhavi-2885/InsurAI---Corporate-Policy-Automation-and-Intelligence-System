import React from 'react';
import toast, { Toaster } from 'react-hot-toast';

// Create a custom hook/utility object for easy access throughout the app
export const useToast = {
    // Success toast (Green background)
    success: (message) => toast.success(message, {
        duration: 4000,
        position: 'top-right',
    }),
    // Error toast (Red background)
    error: (message) => toast.error(message, {
        duration: 5000,
        position: 'top-right',
    }),
    // Info toast (Custom style, Blue background)
    info: (message) => toast(message, {
        duration: 4000,
        position: 'top-right',
        style: {
            backgroundColor: '#e6f2ff',
            color: '#0056b3',
            border: '1px solid #0056b3',
        }
    }),
};

// The component that wraps the entire app and renders the notification container
const ToastProvider = ({ children }) => {
    return (
        <>
            {children}
            {/* The actual container where toasts are rendered */}
            <Toaster />
        </>
    );
};

export default ToastProvider;