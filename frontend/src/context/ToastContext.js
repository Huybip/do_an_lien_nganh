import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { createContext, useContext } from 'react';
import { useToast } from '../hooks/useToast';
import Toast from '../components/ui/Toaster';
const ToastContext = createContext(null);
export function ToastProvider({ children }) {
    const { toasts, toast, removeToast } = useToast();
    return (_jsxs(ToastContext.Provider, { value: { toast }, children: [children, _jsx(Toast, { toasts: toasts, onRemove: removeToast })] }));
}
export function useToastContext() {
    const ctx = useContext(ToastContext);
    if (!ctx)
        throw new Error('useToastContext must be used within ToastProvider');
    return ctx;
}
