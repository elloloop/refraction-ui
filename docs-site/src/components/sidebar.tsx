'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const components = [
  { name: 'Button', href: '/components/button' },
  { name: 'Input', href: '/components/input' },
  { name: 'Dialog', href: '/components/dialog' },
  { name: 'Badge', href: '/components/badge' },
  { name: 'Toast', href: '/components/toast' },
  { name: 'Tabs', href: '/components/tabs' },
]

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Components', href: '/components' },
  { name: 'Theme Playground', href: '/theme' },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-sidebar text-sidebar-foreground overflow-y-auto">
      <div className="px-6 py-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">R</span>
          </div>
          <span className="font-semibold text-lg">Refraction UI</span>
        </Link>
      </div>

      <nav className="px-4 pb-8">
        <div className="space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-md px-3 py-2 text-sm transition-colors ${
                pathname === item.href
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              }`}
            >
              {item.name}
            </Link>
          ))}
        </div>

        <div className="mt-8">
          <h3 className="px-3 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50">
            Components
          </h3>
          <div className="mt-2 space-y-1">
            {components.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`block rounded-md px-3 py-2 text-sm transition-colors ${
                  pathname === item.href
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </aside>
  )
}
