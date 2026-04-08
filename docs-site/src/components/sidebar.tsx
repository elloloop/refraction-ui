'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const componentGroups = [
  {
    title: 'Core UI',
    items: [
      { name: 'Button', href: '/components/button' },
      { name: 'Input', href: '/components/input' },
      { name: 'Textarea', href: '/components/textarea' },
      { name: 'Select', href: '/components/select' },
      { name: 'Checkbox', href: '/components/checkbox' },
      { name: 'Switch', href: '/components/switch' },
      { name: 'OTP Input', href: '/components/otp-input' },
      { name: 'Badge', href: '/components/badge' },
      { name: 'Skeleton', href: '/components/skeleton' },
      { name: 'Avatar', href: '/components/avatar' },
      { name: 'Calendar', href: '/components/calendar' },
      { name: 'Tooltip', href: '/components/tooltip' },
      { name: 'Popover', href: '/components/popover' },
      { name: 'Collapsible', href: '/components/collapsible' },
      { name: 'Dialog', href: '/components/dialog' },
      { name: 'Dropdown Menu', href: '/components/dropdown-menu' },
      { name: 'Command', href: '/components/command' },
      { name: 'Toast', href: '/components/toast' },
      { name: 'Tabs', href: '/components/tabs' },
    ],
  },
  {
    title: 'Layout',
    items: [
      { name: 'Card', href: '/components/card' },
      { name: 'Navbar', href: '/components/navbar' },
      { name: 'Sidebar', href: '/components/sidebar-component' },
      { name: 'Breadcrumbs', href: '/components/breadcrumbs' },
      { name: 'Footer', href: '/components/footer' },
      { name: 'Bottom Nav', href: '/components/bottom-nav' },
    ],
  },
  {
    title: 'Data',
    items: [
      { name: 'Data Table', href: '/components/data-table' },
      { name: 'Progress Display', href: '/components/progress-display' },
    ],
  },
  {
    title: 'Forms',
    items: [
      { name: 'Search Bar', href: '/components/search-bar' },
      { name: 'Language Selector', href: '/components/language-selector' },
      { name: 'Version Selector', href: '/components/version-selector' },
      { name: 'Feedback Dialog', href: '/components/feedback-dialog' },
      { name: 'Inline Editor', href: '/components/inline-editor' },
    ],
  },
  {
    title: 'Media',
    items: [
      { name: 'Video Player', href: '/components/video-player' },
      { name: 'Markdown Renderer', href: '/components/markdown-renderer' },
      { name: 'Code Editor', href: '/components/code-editor' },
      { name: 'Slide Viewer', href: '/components/slide-viewer' },
      { name: 'Animated Text', href: '/components/animated-text' },
    ],
  },
  {
    title: 'Workplace',
    items: [
      { name: 'Date Picker', href: '/components/date-picker' },
      { name: 'Emoji Picker', href: '/components/emoji-picker' },
      { name: 'File Upload', href: '/components/file-upload' },
      { name: 'Avatar Group', href: '/components/avatar-group' },
      { name: 'Presence Indicator', href: '/components/presence-indicator' },
      { name: 'Reaction Bar', href: '/components/reaction-bar' },
      { name: 'Status Indicator', href: '/components/status-indicator' },
      { name: 'Keyboard Shortcut', href: '/components/keyboard-shortcut' },
      { name: 'Rich Editor', href: '/components/rich-editor' },
    ],
  },
  {
    title: 'Other',
    items: [
      { name: 'Install Prompt', href: '/components/install-prompt' },
      { name: 'Content Protection', href: '/components/content-protection' },
      { name: 'Device Frame', href: '/components/device-frame' },
    ],
  },
]

const themeSubItems = [
  { name: 'Theme Playground', href: '/theme' },
  { name: 'Config Editor', href: '/theme/editor' },
  { name: 'Generate Theme', href: '/theme/generate' },
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
    name: 'Theme',
    href: '/theme',
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.098 19.902a3.75 3.75 0 0 0 5.304 0l6.401-6.402M6.75 21A3.75 3.75 0 0 1 3 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 0 0 3.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008Z" />
      </svg>
    ),
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-sidebar-border bg-sidebar-background text-sidebar-foreground overflow-y-auto">
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
            const isActive = item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href)

            return (
              <Link
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
        {pathname.startsWith('/theme') && (
          <div className="mt-4">
            <h3 className="px-3 text-[11px] font-semibold uppercase tracking-widest text-sidebar-foreground/40 mb-2">
              Theme
            </h3>
            <div className="space-y-0.5">
              {themeSubItems.map((item) => {
                const isActive = pathname === item.href

                return (
                  <Link
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
                const isActive = pathname === item.href

                return (
                  <Link
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
  )
}
