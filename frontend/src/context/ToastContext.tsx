import { createContext, useContext } from 'react'
import type { ReactNode } from 'react'
import { useToast } from '../hooks/useToast'
import Toast from '../components/ui/Toaster'

interface ToastContextType {
  toast: {
    success: (msg: string) => void
    error:   (msg: string) => void
    info:    (msg: string) => void
    warning: (msg: string) => void
  }
}

const ToastContext = createContext<ToastContextType | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const { toasts, toast, removeToast } = useToast()

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <Toast toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  )
}

export function useToastContext() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToastContext must be used within ToastProvider')
  return ctx
}