'use client'

import { useMobileNav } from './mobile-nav-context'

export function DocsLayout({ children }: { children: React.ReactNode }) {
  const { setIsOpen } = useMobileNav()

  return (
    <main className="flex-1 w-full md:ml-64">
      <div className="sticky top-0 z-30 flex items-center justify-between md:justify-end gap-3 border-b border-border bg-background/80 backdrop-blur-sm px-4 md:px-8 py-3">
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setIsOpen(true)}
            className="p-2 -ml-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Open navigation menu"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <a
            href="https://github.com/elloloop/tvkit"
            target="_blank"
            rel="noreferrer"
            className="hover:text-foreground transition-colors"
          >
            GitHub
          </a>
        </div>
      </div>
      <div className="mx-auto max-w-4xl px-4 sm:px-6 md:px-8 py-8 md:py-12">
        {children}
      </div>
    </main>
  )
}
