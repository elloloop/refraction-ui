'use client'

import { ToastProvider } from '@refraction-ui/react-toast'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      {children}
    </ToastProvider>
  )
}
