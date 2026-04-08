import Link from 'next/link'

const components = [
  // Core UI
  { name: 'Button', href: '/components/button', description: 'Clickable button with 6 variants, 5 sizes, loading and disabled states.', category: 'Core UI' },
  { name: 'Input', href: '/components/input', description: 'Text input with size variants, validation states, and multiple input types.', category: 'Core UI' },
  { name: 'Textarea', href: '/components/textarea', description: 'Multi-line text input with size variants, placeholder, and disabled states.', category: 'Core UI' },
  { name: 'Select', href: '/components/select', description: 'Dropdown select with compound component pattern and keyboard navigation.', category: 'Core UI' },
  { name: 'Checkbox', href: '/components/checkbox', description: 'Checkbox with checked, unchecked, and indeterminate states.', category: 'Core UI' },
  { name: 'Switch', href: '/components/switch', description: 'Toggle switch with three sizes and disabled state.', category: 'Core UI' },
  { name: 'OTP Input', href: '/components/otp-input', description: 'One-time password input with auto-advance and paste support.', category: 'Core UI' },
  { name: 'Badge', href: '/components/badge', description: 'Status badge with 7 variants including semantic success, warning, and destructive.', category: 'Core UI' },
  { name: 'Skeleton', href: '/components/skeleton', description: 'Placeholder loading elements with rectangle, circle, and text shapes.', category: 'Core UI' },
  { name: 'Avatar', href: '/components/avatar', description: 'Circular avatar with image support and fallback initials in 5 sizes.', category: 'Core UI' },
  { name: 'Calendar', href: '/components/calendar', description: 'Month-view calendar with date selection and navigation.', category: 'Core UI' },
  { name: 'Tooltip', href: '/components/tooltip', description: 'Hover-triggered tooltip with configurable delay and placement.', category: 'Core UI' },
  { name: 'Popover', href: '/components/popover', description: 'Popup content panel with trigger, controlled/uncontrolled modes.', category: 'Core UI' },
  { name: 'Collapsible', href: '/components/collapsible', description: 'Toggle content visibility with compound trigger and content.', category: 'Core UI' },
  { name: 'Dialog', href: '/components/dialog', description: 'Modal dialog with compound components: trigger, overlay, content, header, footer.', category: 'Core UI' },
  { name: 'Dropdown Menu', href: '/components/dropdown-menu', description: 'Dropdown menu with items, separators, labels, and keyboard navigation.', category: 'Core UI' },
  { name: 'Command', href: '/components/command', description: 'Searchable command palette with groups and keyboard navigation.', category: 'Core UI' },
  { name: 'Toast', href: '/components/toast', description: 'Notification toasts with auto-dismiss, hover pause, and 4 variants.', category: 'Core UI' },
  { name: 'Tabs', href: '/components/tabs', description: 'Tabbed interface with keyboard navigation and ARIA support.', category: 'Core UI' },

  // Layout
  { name: 'Card', href: '/components/card', description: 'Container with header, content, and footer compound components.', category: 'Layout' },
  { name: 'Navbar', href: '/components/navbar', description: 'Sticky header with navigation links, logo, and action slots.', category: 'Layout' },
  { name: 'Sidebar', href: '/components/sidebar-component', description: 'Vertical navigation panel with sections, items, and collapsed mode.', category: 'Layout' },
  { name: 'Breadcrumbs', href: '/components/breadcrumbs', description: 'Breadcrumb trail auto-generated from pathname or manual items.', category: 'Layout' },
  { name: 'Footer', href: '/components/footer', description: 'Site footer with link columns, copyright, and social links.', category: 'Layout' },
  { name: 'Bottom Nav', href: '/components/bottom-nav', description: 'Mobile tab bar fixed to the bottom of the viewport.', category: 'Layout' },

  // Data
  { name: 'Data Table', href: '/components/data-table', description: 'Sortable, filterable data table with column definitions.', category: 'Data' },
  { name: 'Progress Display', href: '/components/progress-display', description: 'Stats grid, progress bar, and badge display components.', category: 'Data' },

  // Forms
  { name: 'Search Bar', href: '/components/search-bar', description: 'Search input with debounced search and suggestions dropdown.', category: 'Forms' },
  { name: 'Language Selector', href: '/components/language-selector', description: 'Dropdown language selector with single and multi-select.', category: 'Forms' },
  { name: 'Version Selector', href: '/components/version-selector', description: 'Version dropdown with "Latest" badge indicator.', category: 'Forms' },
  { name: 'Feedback Dialog', href: '/components/feedback-dialog', description: 'Feedback form dialog with trigger button and submit callback.', category: 'Forms' },
  { name: 'Inline Editor', href: '/components/inline-editor', description: 'Inline view/edit toggle for editing text content in place.', category: 'Forms' },

  // Media
  { name: 'Video Player', href: '/components/video-player', description: 'Video player with custom controls, progress, and fullscreen.', category: 'Media' },
  { name: 'Markdown Renderer', href: '/components/markdown-renderer', description: 'Renders markdown content as styled HTML with prose typography.', category: 'Media' },
  { name: 'Code Editor', href: '/components/code-editor', description: 'Code editor with syntax highlighting and editing support.', category: 'Media' },
  { name: 'Slide Viewer', href: '/components/slide-viewer', description: 'Slide presentation viewer with navigation and progress.', category: 'Media' },
  { name: 'Animated Text', href: '/components/animated-text', description: 'Word carousel and typewriter text animation components.', category: 'Media' },

  // Workplace
  { name: 'Date Picker', href: '/components/date-picker', description: 'Date picker with calendar dropdown and time selection.', category: 'Workplace' },
  { name: 'Emoji Picker', href: '/components/emoji-picker', description: 'Emoji picker with categories, search, and click-to-select.', category: 'Workplace' },
  { name: 'File Upload', href: '/components/file-upload', description: 'Drag and drop file upload zone with file list and validation.', category: 'Workplace' },
  { name: 'Avatar Group', href: '/components/avatar-group', description: 'Overlapping avatar stack with overflow badge.', category: 'Workplace' },
  { name: 'Presence Indicator', href: '/components/presence-indicator', description: 'Colored status dots: online, away, busy, offline.', category: 'Workplace' },
  { name: 'Reaction Bar', href: '/components/reaction-bar', description: 'Emoji reaction pills with counts and toggle state.', category: 'Workplace' },
  { name: 'Status Indicator', href: '/components/status-indicator', description: 'System status dots with labels and optional pulse animation.', category: 'Workplace' },
  { name: 'Keyboard Shortcut', href: '/components/keyboard-shortcut', description: 'Keyboard shortcut badge display and key listener.', category: 'Workplace' },
  { name: 'Rich Editor', href: '/components/rich-editor', description: 'Rich text editor (coming soon).', category: 'Workplace' },

  // Other
  { name: 'Install Prompt', href: '/components/install-prompt', description: 'PWA install banner with install and dismiss actions.', category: 'Other' },
  { name: 'Content Protection', href: '/components/content-protection', description: 'Watermark overlay and copy/right-click protection.', category: 'Other' },
  { name: 'Device Frame', href: '/components/device-frame', description: 'iPhone, iPad, and device mockup frames for screenshots.', category: 'Other' },
]

const categoryIcons: Record<string, React.ReactNode> = {
  'Core UI': (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672 13.684 16.6m0 0-2.51 2.225.569-9.47 5.227 7.917-3.286-.672ZM12 2.25V4.5m5.834.166-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243-1.59-1.59" />
    </svg>
  ),
  Layout: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25a2.25 2.25 0 0 1-2.25-2.25v-2.25Z" />
    </svg>
  ),
  Data: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6Z" />
    </svg>
  ),
  Forms: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
    </svg>
  ),
  Media: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
    </svg>
  ),
  Workplace: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0M12 12.75h.008v.008H12v-.008Z" />
    </svg>
  ),
  Other: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.431.992a7.723 7.723 0 0 1 0 .255c-.007.378.138.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
  ),
}

const categories = ['Core UI', 'Layout', 'Data', 'Forms', 'Media', 'Workplace', 'Other']

export default function ComponentsPage() {
  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Components</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Browse the component catalog. Each component has live examples, a props table, and code snippets.
        </p>
      </div>

      {categories.map((category) => {
        const categoryComponents = components.filter((c) => c.category === category)
        if (categoryComponents.length === 0) return null

        return (
          <div key={category} className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">{categoryIcons[category]}</span>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                {category}
              </h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {categoryComponents.map((component) => (
                <Link
                  key={component.href}
                  href={component.href}
                  className="group relative rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/50 hover:shadow-md hover:shadow-primary/5"
                >
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      {component.name}
                    </h3>
                    <svg className="h-4 w-4 text-muted-foreground opacity-0 -translate-x-1 transition-all group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-primary" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                    </svg>
                  </div>
                  <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                    {component.description}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
