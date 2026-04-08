'use client'

import { usePathname } from 'next/navigation'
import { ModeToggle } from './mode-toggle'
import { ThemeSwitcher } from './theme-switcher'

export function MainContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isExample = pathname.startsWith('/examples/')

  if (isExample) {
    return (
      <div className="min-h-screen">
        {children}
        {/* Small "Built with Refraction UI" badge linking back to docs */}
        <a
          href="/examples"
          className="fixed bottom-4 left-4 z-50 flex items-center gap-1.5 rounded-full bg-foreground/5 px-3 py-1.5 text-xs text-muted-foreground hover:bg-foreground/10 transition-colors backdrop-blur-sm"
        >
          <span className="h-3 w-3 rounded bg-primary flex items-center justify-center text-[8px] text-primary-foreground font-bold">R</span>
          Built with Refraction UI
        </a>
      </div>
    )
  }

  return (
    <main className="flex-1 ml-64">
      {/* Top bar with theme switcher */}
      <div className="sticky top-0 z-30 flex items-center justify-end gap-3 border-b border-border bg-background/80 backdrop-blur-sm px-8 py-3">
        <ModeToggle />
        <ThemeSwitcher />
      </div>
      <div className="mx-auto max-w-4xl px-8 py-12">
        {children}
      </div>
    </main>
  )
}
