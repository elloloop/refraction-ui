'use client'

import { usePathname } from 'next/navigation'
import { Sidebar } from './sidebar'

export function ConditionalSidebar() {
  const pathname = usePathname()
  // Hide sidebar for individual example pages (but not the /examples index)
  if (pathname.startsWith('/examples/')) return null
  return <Sidebar />
}
