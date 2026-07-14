'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { useMobileNav } from './mobile-nav-context'

const componentGroups = [
  {
    title: "All Components",
    items: [
      {
        name: "Accordion",
        href: "/components/accordion"
      },
      {
        name: "Alert",
        href: "/components/alert"
      },
      {
        name: "Animated Text",
        href: "/components/animated-text"
      },
      {
        name: "App Shell",
        href: "/components/app-shell"
      },
      {
        name: "Audience Feature Card",
        href: "/components/audience-feature-card"
      },
      {
        name: "Audio Room",
        href: "/components/audio-room"
      },
      {
        name: "Avatar",
        href: "/components/avatar"
      },
      {
        name: "Avatar Group",
        href: "/components/avatar-group"
      },
      {
        name: "Badge",
        href: "/components/badge"
      },
      {
        name: "Bottom Nav",
        href: "/components/bottom-nav"
      },
      {
        name: "Brand Network Cell",
        href: "/components/brand-network-cell"
      },
      {
        name: "Breadcrumbs",
        href: "/components/breadcrumbs"
      },
      {
        name: "Browser Chrome Mock",
        href: "/components/browser-chrome-mock"
      },
      {
        name: "Button",
        href: "/components/button"
      },
      {
        name: "Calendar",
        href: "/components/calendar"
      },
      {
        name: "Call Controls",
        href: "/components/call-controls"
      },
      {
        name: "Callout",
        href: "/components/callout"
      },
      {
        name: "Card",
        href: "/components/card"
      },
      {
        name: "Card Grid",
        href: "/components/card-grid"
      },
      {
        name: "Carousel",
        href: "/components/carousel"
      },
      {
        name: "Charts",
        href: "/components/charts"
      },
      {
        name: "Chat Input",
        href: "/components/chat-input"
      },
      {
        name: "Checkbox",
        href: "/components/checkbox"
      },
      {
        name: "Checklist",
        href: "/components/checklist"
      },
      {
        name: "Code Block",
        href: "/components/code-block"
      },
      {
        name: "Code Editor",
        href: "/components/code-editor"
      },
      {
        name: "Collapsible",
        href: "/components/collapsible"
      },
      {
        name: "Combobox",
        href: "/components/combobox"
      },
      {
        name: "Command",
        href: "/components/command"
      },
      {
        name: "Command Input",
        href: "/components/command-input"
      },
      {
        name: "Command Menu",
        href: "/components/command-menu"
      },
      {
        name: "Composer",
        href: "/components/composer"
      },
      {
        name: "Content Protection",
        href: "/components/content-protection"
      },
      {
        name: "Conversation",
        href: "/components/conversation"
      },
      {
        name: "Cookie Consent",
        href: "/components/cookie-consent"
      },
      {
        name: "Data Table",
        href: "/components/data-table"
      },
      {
        name: "Date Picker",
        href: "/components/date-picker"
      },
      {
        name: "Device Frame",
        href: "/components/device-frame"
      },
      {
        name: "Dialog",
        href: "/components/dialog"
      },
      {
        name: "Diff Viewer",
        href: "/components/diff-viewer"
      },
      {
        name: "Dropdown Menu",
        href: "/components/dropdown-menu"
      },
      {
        name: "Editor Status Bar",
        href: "/components/editor-status-bar"
      },
      {
        name: "Editor Tabs",
        href: "/components/editor-tabs"
      },
      {
        name: "Emoji Picker",
        href: "/components/emoji-picker"
      },
      {
        name: "Empty State",
        href: "/components/empty-state"
      },
      {
        name: "Feedback Dialog",
        href: "/components/feedback-dialog"
      },
      {
        name: "File Tree",
        href: "/components/file-tree"
      },
      {
        name: "File Upload",
        href: "/components/file-upload"
      },
      {
        name: "Floating Reactions",
        href: "/components/floating-reactions"
      },
      {
        name: "Flow Editor",
        href: "/components/flow-editor"
      },
      {
        name: "Footer",
        href: "/components/footer"
      },
      {
        name: "Form",
        href: "/components/form"
      },
      {
        name: "Graph View",
        href: "/components/graph-view"
      },
      {
        name: "Infinite Canvas",
        href: "/components/infinite-canvas"
      },
      {
        name: "Inline Editor",
        href: "/components/inline-editor"
      },
      {
        name: "Input",
        href: "/components/input"
      },
      {
        name: "Input Group",
        href: "/components/input-group"
      },
      {
        name: "Install Prompt",
        href: "/components/install-prompt"
      },
      {
        name: "Kanban Board",
        href: "/components/kanban-board"
      },
      {
        name: "Keyboard Shortcut",
        href: "/components/keyboard-shortcut"
      },
      {
        name: "Language Selector",
        href: "/components/language-selector"
      },
      {
        name: "Link Card",
        href: "/components/link-card"
      },
      {
        name: "Live Captions",
        href: "/components/live-captions"
      },
      {
        name: "Live Cursors",
        href: "/components/live-cursors"
      },
      {
        name: "Live Transcript",
        href: "/components/live-transcript"
      },
      {
        name: "Location Selector",
        href: "/components/location-selector"
      },
      {
        name: "Logger",
        href: "/components/logger"
      },
      {
        name: "Markdown Renderer",
        href: "/components/markdown-renderer"
      },
      {
        name: "Marquee Strip",
        href: "/components/marquee-strip"
      },
      {
        name: "Mastery Bar",
        href: "/components/mastery-bar"
      },
      {
        name: "Mini Map",
        href: "/components/mini-map"
      },
      {
        name: "Mobile Nav",
        href: "/components/mobile-nav"
      },
      {
        name: "Navbar",
        href: "/components/navbar"
      },
      {
        name: "Numbered Steps",
        href: "/components/numbered-steps"
      },
      {
        name: "Otp Input",
        href: "/components/otp-input"
      },
      {
        name: "Pagination",
        href: "/components/pagination"
      },
      {
        name: "Password Input",
        href: "/components/password-input"
      },
      {
        name: "Payment",
        href: "/components/payment"
      },
      {
        name: "Popover",
        href: "/components/popover"
      },
      {
        name: "Pre Call Lobby",
        href: "/components/pre-call-lobby"
      },
      {
        name: "Presence Indicator",
        href: "/components/presence-indicator"
      },
      {
        name: "Pricing Card",
        href: "/components/pricing-card"
      },
      {
        name: "Progress Display",
        href: "/components/progress-display"
      },
      {
        name: "Radial Gauge",
        href: "/components/radial-gauge"
      },
      {
        name: "Radio",
        href: "/components/radio"
      },
      {
        name: "Radio Group",
        href: "/components/radio-group"
      },
      {
        name: "Rating Scale",
        href: "/components/rating-scale"
      },
      {
        name: "Reaction Bar",
        href: "/components/reaction-bar"
      },
      {
        name: "Resizable Layout",
        href: "/components/resizable-layout"
      },
      {
        name: "Rich Editor",
        href: "/components/rich-editor"
      },
      {
        name: "Search Bar",
        href: "/components/search-bar"
      },
      {
        name: "Section Head",
        href: "/components/section-head"
      },
      {
        name: "Segmented Control",
        href: "/components/segmented-control"
      },
      {
        name: "Select",
        href: "/components/select"
      },
      {
        name: "Separator",
        href: "/components/separator"
      },
      {
        name: "Sheet",
        href: "/components/sheet"
      },
      {
        name: "Sidebar",
        href: "/components/sidebar"
      },
      {
        name: "Skeleton",
        href: "/components/skeleton"
      },
      {
        name: "Skip To Content",
        href: "/components/skip-to-content"
      },
      {
        name: "Slide Viewer",
        href: "/components/slide-viewer"
      },
      {
        name: "Slider",
        href: "/components/slider"
      },
      {
        name: "Slot Picker",
        href: "/components/slot-picker"
      },
      {
        name: "Social Auth Button",
        href: "/components/social-auth-button"
      },
      {
        name: "Sortable List",
        href: "/components/sortable-list"
      },
      {
        name: "Stat Grid",
        href: "/components/stat-grid"
      },
      {
        name: "Status Indicator",
        href: "/components/status-indicator"
      },
      {
        name: "Steps",
        href: "/components/steps"
      },
      {
        name: "Sticky Note",
        href: "/components/sticky-note"
      },
      {
        name: "Switch",
        href: "/components/switch"
      },
      {
        name: "Table Of Contents",
        href: "/components/table-of-contents"
      },
      {
        name: "Tabs",
        href: "/components/tabs"
      },
      {
        name: "Terminal",
        href: "/components/terminal"
      },
      {
        name: "Test Results",
        href: "/components/test-results"
      },
      {
        name: "Textarea",
        href: "/components/textarea"
      },
      {
        name: "Thread View",
        href: "/components/thread-view"
      },
      {
        name: "Timeline",
        href: "/components/timeline"
      },
      {
        name: "Toast",
        href: "/components/toast"
      },
      {
        name: "Tooltip",
        href: "/components/tooltip"
      },
      {
        name: "Version Selector",
        href: "/components/version-selector"
      },
      {
        name: "Video Grid",
        href: "/components/video-grid"
      },
      {
        name: "Video Player",
        href: "/components/video-player"
      },
      {
        name: "Video Tile",
        href: "/components/video-tile"
      },
      {
        name: "Voice Pill",
        href: "/components/voice-pill"
      },
      {
        name: "Waveform",
        href: "/components/waveform"
      },
      {
        name: "Wizard",
        href: "/components/wizard"
      }
    ]
  }
]

const themeSubItems = [
  { name: 'Theme Generator', href: '/theme-generator' },
]

const navigation = [
  {
    name: 'Home',
    href: '/',
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
      </svg>
    ),
  },
  {
    name: 'Components',
    href: '/components',
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75 2.25 12l4.179 2.25m0-4.5 5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L12 12.75 6.429 9.75m11.142 0 4.179 2.25-4.179 2.25m0 0L12 17.25l-5.571-3m11.142 0 4.179 2.25L12 21.75l-9.75-5.25 4.179-2.25" />
      </svg>
    ),
  },
  {
    name: 'Examples',
    href: '/examples',
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 7.125C2.25 6.504 2.754 6 3.375 6h6c.621 0 1.125.504 1.125 1.125v3.75c0 .621-.504 1.125-1.125 1.125h-6a1.125 1.125 0 0 1-1.125-1.125v-3.75ZM14.25 8.625c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v8.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 0 1-1.125-1.125v-8.25ZM3.75 16.125c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 0 1-1.125-1.125v-2.25Z" />
      </svg>
    ),
  },
  {
    name: 'Theme',
    href: '/theme-generator',
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.098 19.902a3.75 3.75 0 0 0 5.304 0l6.401-6.402M6.75 21A3.75 3.75 0 0 1 3 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 0 0 3.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008Z" />
      </svg>
    ),
  },
  {
    name: 'Analytics',
    href: '/analytics',
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
      </svg>
    ),
  },
  {
    name: 'Flutter UI',
    href: '/flutter/',
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
      </svg>
    ),
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const currentPath = normalizePath(pathname)
  const { isOpen, setIsOpen } = useMobileNav()
  const sidebarRef = useRef<HTMLElement | null>(null)
  const activeComponentRef = useRef<HTMLAnchorElement | null>(null)

  useEffect(() => {
    const sidebar = sidebarRef.current
    const activeComponent = activeComponentRef.current

    if (!sidebar || !activeComponent) return

    const sidebarBounds = sidebar.getBoundingClientRect()
    const itemBounds = activeComponent.getBoundingClientRect()
    const topPadding = 96
    const bottomPadding = 32
    const isAboveView = itemBounds.top < sidebarBounds.top + topPadding
    const isBelowView = itemBounds.bottom > sidebarBounds.bottom - bottomPadding

    if (isAboveView || isBelowView) {
      activeComponent.scrollIntoView({ block: 'center' })
    }
  }, [currentPath])

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden transition-opacity"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside ref={sidebarRef} className={`fixed left-0 top-0 z-40 h-screen w-64 border-r border-sidebar-border bg-sidebar-background text-sidebar-foreground overflow-y-auto transition-transform duration-300 ease-in-out md:translate-x-0 ${
        isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
      }`}>
      {/* Logo */}
      <div className="px-6 py-6">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shadow-sm">
            <span className="text-primary-foreground font-bold text-sm">R</span>
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-sm leading-tight">Refraction UI</span>
            <span className="text-[10px] text-sidebar-foreground/50 leading-tight">v0.1.0</span>
          </div>
        </Link>
      </div>

      {/* Divider */}
      <div className="mx-4 border-t border-sidebar-border" />

      <nav className="px-3 py-4 pb-8">
        {/* Main navigation */}
        <div className="space-y-0.5">
          {navigation.map((item) => {
            const itemPath = normalizePath(item.href)
            const isActive = item.href === '/'
              ? currentPath === '/'
              : currentPath.startsWith(itemPath)

            const isExternal = item.href.startsWith('/flutter');

            if (isExternal) {
              return (
                <a
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                    isActive
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                      : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
                  }`}
                >
                  <span className={isActive ? 'text-sidebar-primary' : 'text-sidebar-foreground/50'}>
                    {item.icon}
                  </span>
                  {item.name}
                </a>
              )
            }

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
                <span className={isActive ? 'text-sidebar-primary' : 'text-sidebar-foreground/50'}>
                  {item.icon}
                </span>
                {item.name}
              </Link>
            )
          })}
        </div>

        {/* Theme sub-navigation */}
        {currentPath.startsWith('/theme') && (
          <div className="mt-4">
            <h3 className="px-3 text-[11px] font-semibold uppercase tracking-widest text-sidebar-foreground/40 mb-2">
              Theme
            </h3>
            <div className="space-y-0.5">
              {themeSubItems.map((item) => {
                const isActive = currentPath === normalizePath(item.href)

                return (
                  <Link
                    ref={isActive ? activeComponentRef : undefined}
                    aria-current={isActive ? 'page' : undefined}
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
        )}

        {/* Component groups */}
        {componentGroups.map((group) => (
          <div key={group.title} className="mt-6">
            <h3 className="px-3 text-[11px] font-semibold uppercase tracking-widest text-sidebar-foreground/40 mb-2">
              {group.title}
            </h3>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = currentPath === normalizePath(item.href)

                return (
                  <Link
                    ref={isActive ? activeComponentRef : undefined}
                    aria-current={isActive ? 'page' : undefined}
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

function normalizePath(path: string): string {
  if (path === '/') return path

  return path.replace(/\/+$/, '')
}
