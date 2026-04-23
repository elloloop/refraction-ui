'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useMobileNav } from './mobile-nav-context'

const groups: Array<{ title: string; items: Array<{ name: string; href: string }> }> = [
  {
    title: 'Start here',
    items: [
      { name: 'Overview', href: '/' },
      { name: 'Getting started', href: '/getting-started' },
    ],
  },
  {
    title: 'Reference',
    items: [
      { name: 'Platforms', href: '/platforms' },
      { name: 'CLI', href: '/cli' },
      { name: 'API — Core', href: '/api/core' },
      { name: 'API — Platforms', href: '/api/platforms' },
    ],
  },
  {
    title: 'Design',
    items: [
      { name: 'Architecture', href: '/architecture' },
      { name: 'Publishing', href: '/publishing' },
    ],
  },
]

export function DocsSidebar() {
  const pathname = usePathname()
  const { isOpen, setIsOpen } = useMobileNav()

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden transition-opacity"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-40 h-screen w-64 border-r border-sidebar-border bg-sidebar-background text-sidebar-foreground overflow-y-auto transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        <div className="px-6 py-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shadow-sm">
              <span className="text-primary-foreground font-bold text-sm">tv</span>
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-sm leading-tight">tvkit</span>
              <span className="text-[10px] text-sidebar-foreground/50 leading-tight">
                v1 — web-first
              </span>
            </div>
          </Link>
        </div>

        <div className="mx-4 border-t border-sidebar-border" />

        <nav className="px-3 py-4 pb-8">
          {groups.map((group) => (
            <div key={group.title} className="mt-6 first:mt-0">
              <h3 className="px-3 text-[11px] font-semibold uppercase tracking-widest text-sidebar-foreground/40 mb-2">
                {group.title}
              </h3>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive =
                    item.href === '/'
                      ? pathname === '/'
                      : pathname === item.href || pathname.startsWith(item.href + '/')

                  return (
                    <Link
                      onClick={() => setIsOpen(false)}
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                        isActive
                          ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                          : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
                      }`}
                    >
                      {isActive && (
                        <span className="h-1 w-1 rounded-full bg-sidebar-primary flex-shrink-0" />
                      )}
                      <span className={isActive ? '' : 'ml-3'}>{item.name}</span>
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>
    </>
  )
}
