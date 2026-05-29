'use client'

import { usePathname } from 'next/navigation'
import { ModeToggle } from './mode-toggle'
import { ThemeSwitcher } from './theme-switcher'
import { useMobileNav } from './mobile-nav-context'

export function MainContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isExample = pathname.startsWith('/examples/')
  const { setIsOpen } = useMobileNav()

  if (isExample) {
    return (
      <div className="min-h-screen w-full flex-1">
        {children}
        {/* Small "Built with Refraction UI" badge linking back to docs */}
        <a
          href="/"
          className="fixed bottom-4 left-4 z-50 flex items-center gap-1.5 rounded-full bg-foreground/5 px-3 py-1.5 text-xs text-muted-foreground hover:bg-foreground/10 transition-colors backdrop-blur-sm"
        >
          <span className="h-3 w-3 rounded bg-primary flex items-center justify-center text-[8px] text-primary-foreground font-bold">R</span>
          Built with Refraction UI
        </a>
      </div>
    )
  }

  return (
    <main className="flex-1 w-full md:ml-64">
      {/* Top bar with theme switcher */}
      <div className="sticky top-0 z-30 flex items-center justify-between md:justify-end gap-3 border-b border-border bg-background/80 backdrop-blur-sm px-4 md:px-8 py-3">
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setIsOpen(true)}
            className="p-2 -ml-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Open navigation menu"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
        <div className="flex items-center gap-3">
          <ModeToggle />
          <ThemeSwitcher />
        </div>
      </div>
      <div className="mx-auto max-w-4xl px-4 sm:px-6 md:px-8 py-8 md:py-12">
        {children}
      </div>
    </main>
  )
}

