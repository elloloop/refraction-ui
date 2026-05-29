'use client'

import { ThemeProvider } from '@refraction-ui/react-theme'
import { ToastProvider } from '@refraction-ui/react-toast'
import { ShortcutProvider } from '@refraction-ui/react'
import { MobileNavProvider } from '@/components/mobile-nav-context'
import { FrameworkProvider } from '@/components/framework-context'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider defaultMode="light" attribute="class">
      <ShortcutProvider>
        <ToastProvider>
          <FrameworkProvider>
            <MobileNavProvider>
              {children}
            </MobileNavProvider>
          </FrameworkProvider>
        </ToastProvider>
      </ShortcutProvider>
    </ThemeProvider>
  )
}
