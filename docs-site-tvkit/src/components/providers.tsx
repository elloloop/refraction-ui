'use client'

import { ThemeProvider } from '@refraction-ui/react-theme'
import { MobileNavProvider } from './mobile-nav-context'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider defaultMode="light" attribute="class">
      <MobileNavProvider>{children}</MobileNavProvider>
    </ThemeProvider>
  )
}
