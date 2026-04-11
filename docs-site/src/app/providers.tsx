'use client'

import { ThemeProvider } from '@refraction-ui/react-theme'
import { ToastProvider } from '@refraction-ui/react-toast'
import { MobileNavProvider } from '@/components/mobile-nav-context'
import { FrameworkProvider } from '@/components/framework-context'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider defaultMode="light" attribute="class">
      <ToastProvider>
        <FrameworkProvider>
          <MobileNavProvider>
            {children}
          </MobileNavProvider>
        </FrameworkProvider>
      </ToastProvider>
    </ThemeProvider>
  )
}
