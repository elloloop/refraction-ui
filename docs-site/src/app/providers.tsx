'use client'

import { ThemeProvider } from '@refraction-ui/react-theme'
import { ToastProvider } from '@refraction-ui/react-toast'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider defaultMode="light" attribute="class">
      <ToastProvider>
        {children}
      </ToastProvider>
    </ThemeProvider>
  )
}
