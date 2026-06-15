'use client'

import { useState, useMemo } from 'react'
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
  // AI
  { name: 'Voice Pill', href: '/components/voice-pill', description: 'Floating speaker indicator with intensity-driven pulse and mute control.', category: 'AI' },
  { name: 'Waveform', href: '/components/waveform', description: 'Canvas audio visualization for live analysers, samples, or intensity streams.', category: 'AI' },

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

  // Telemetry
  { name: 'Logger', href: '/components/logger', description: 'Headless Faro-backed telemetry: createTelemetry, child loggers, async spans, React provider/hooks.', category: 'Telemetry' },

  // Other
  { name: 'Install Prompt', href: '/components/install-prompt', description: 'PWA install banner with install and dismiss actions.', category: 'Other' },
  { name: 'Content Protection', href: '/components/content-protection', description: 'Watermark overlay and copy/right-click protection.', category: 'Other' },
  { name: 'Device Frame', href: '/components/device-frame', description: 'iPhone, iPad, and device mockup frames for screenshots.', category: 'Other' },

  { name: 'Section Head', href: '/components/section-head', description: 'Section header with title, subtitle, and action buttons.', category: 'Layout' },
  { name: 'Stat Grid', href: '/components/stat-grid', description: 'Grid display for key metrics, growth rates, and trends.', category: 'Data' },
  { name: 'Numbered Steps', href: '/components/numbered-steps', description: 'Sequential guide list with status indicators.', category: 'Layout' },
  { name: 'Pricing Card', href: '/components/pricing-card', description: 'Feature lists and tier details for subscriptions.', category: 'Other' },
  { name: 'Brand Network Cell', href: '/components/brand-network-cell', description: 'Interactive network node displaying brand metrics.', category: 'Other' },
  { name: 'Marquee Strip', href: '/components/marquee-strip', description: 'Auto-scrolling banner for brand logos or notices.', category: 'Media' },
  { name: 'Browser Chrome Mock', href: '/components/browser-chrome-mock', description: 'Mock browser shell for displaying web previews.', category: 'Other' },
  { name: 'Mastery Bar', href: '/components/mastery-bar', description: 'Progress bar indicating skill or completeness levels.', category: 'Data' },
  { name: 'Audience Feature Card', href: '/components/audience-feature-card', description: 'Descriptive card highlighting target audiences.', category: 'Layout' },
  { name: 'Sortable List', href: '/components/sortable-list', description: 'Drag-and-drop sortable list of items.', category: 'Workplace' },
  { name: 'Kanban Board', href: '/components/kanban-board', description: 'Board with columns for task status management.', category: 'Workplace' },
  { name: 'Slot Picker', href: '/components/slot-picker', description: 'Time/date slot selection grid.', category: 'Forms' },
  { name: 'Editor Tabs', href: '/components/editor-tabs', description: 'IDE-style horizontal file/tab navigation bar.', category: 'Core UI' },
  { name: 'Editor Status Bar', href: '/components/editor-status-bar', description: 'Horizontal bottom bar displaying status information.', category: 'Layout' },
  { name: 'Terminal', href: '/components/terminal', description: 'Mock interactive command line terminal.', category: 'Workplace' },
  { name: 'Test Results', href: '/components/test-results', description: 'Visual representation of unit test suite executions.', category: 'Data' },
  { name: 'Video Tile', href: '/components/video-tile', description: 'Call participant video tile with status overlays.', category: 'Media' },
  { name: 'Video Grid', href: '/components/video-grid', description: 'Grid container for multiple video tiles.', category: 'Media' },
  { name: 'Call Controls', href: '/components/call-controls', description: 'Actions bar for managing audio, video, and screenshare.', category: 'Media' },
  { name: 'Live Captions', href: '/components/live-captions', description: 'Real-time speech-to-text subtitle overlay.', category: 'Media' },
  { name: 'Live Transcript', href: '/components/live-transcript', description: 'Full conversation transcription list with search.', category: 'Media' },
  { name: 'Audio Room', href: '/components/audio-room', description: 'Voice chat channel grid with speaker focus states.', category: 'Media' },
  { name: 'Floating Reactions', href: '/components/floating-reactions', description: 'Floating emoji reaction overlays.', category: 'Media' },
  { name: 'Pre Call Lobby', href: '/components/pre-call-lobby', description: 'Device setup and test screen before joining calls.', category: 'Media' },
  { name: 'Infinite Canvas', href: '/components/infinite-canvas', description: 'Zoomable, pannable layout for diagramming.', category: 'Workplace' },
  { name: 'Sticky Note', href: '/components/sticky-note', description: 'Interactive canvas sticky note with customizable colors.', category: 'Workplace' },
  { name: 'Flow Editor', href: '/components/flow-editor', description: 'Interactive node-based flowchart editor.', category: 'Workplace' },
  { name: 'Graph View', href: '/components/graph-view', description: 'Interactive visualization of relational graphs.', category: 'Workplace' },
  { name: 'Live Cursors', href: '/components/live-cursors', description: 'Real-time collaborative cursor indicator overlays.', category: 'Workplace' },
  { name: 'Mini Map', href: '/components/mini-map', description: 'Overview map overlay for infinite canvas navigation.', category: 'Workplace' },
  { name: 'Rating Scale', href: '/components/rating-scale', description: 'Visual rating input with customizable range.', category: 'Forms' },
  { name: 'Wizard', href: '/components/wizard', description: 'Multi-step form wizard with progress indicators.', category: 'Forms' },
  { name: 'Radial Gauge', href: '/components/radial-gauge', description: 'Circular dial gauge for displaying percentage values.', category: 'Data' },
  { name: 'Timeline', href: '/components/timeline', description: 'Vertical sequence flow displaying chronological events.', category: 'Data' },
  { name: 'Checklist', href: '/components/checklist', description: 'To-do list with interactive check states.', category: 'Forms' },
]

const categories = ['All', 'Core UI', 'Layout', 'Data', 'Forms', 'Media', 'AI', 'Workplace', 'Telemetry', 'Other']

const categoryColors: Record<string, string> = {
  'Core UI': 'bg-primary/10 text-primary ring-primary/20',
  Layout: 'bg-blue-500/10 text-blue-600 ring-blue-500/20 dark:text-blue-400',
  Data: 'bg-emerald-500/10 text-emerald-600 ring-emerald-500/20 dark:text-emerald-400',
  Forms: 'bg-amber-500/10 text-amber-600 ring-amber-500/20 dark:text-amber-400',
  Media: 'bg-pink-500/10 text-pink-600 ring-pink-500/20 dark:text-pink-400',
  AI: 'bg-cyan-500/10 text-cyan-600 ring-cyan-500/20 dark:text-cyan-400',
  Workplace: 'bg-violet-500/10 text-violet-600 ring-violet-500/20 dark:text-violet-400',
  Other: 'bg-muted text-muted-foreground ring-border',
}

export default function ComponentsPage() {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')

  const filtered = useMemo(() => {
    return components.filter((c) => {
      const matchesSearch = search === '' ||
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.description.toLowerCase().includes(search.toLowerCase())
      const matchesCategory = activeCategory === 'All' || c.category === activeCategory
      return matchesSearch && matchesCategory
    })
  }, [search, activeCategory])

  const groupedByCategory = useMemo(() => {
    const groups: Record<string, typeof components> = {}
    for (const c of filtered) {
      if (!groups[c.category]) groups[c.category] = []
      groups[c.category].push(c)
    }
    return groups
  }, [filtered])

  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-foreground">Components</h1>
        <p className="mt-3 text-lg text-muted-foreground max-w-2xl leading-relaxed">
          {components.length} production-ready components, each with live examples, copy-paste code, and a complete props reference.
        </p>
      </div>

      {/* Search */}
      <div className="space-y-4">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <input
            type="text"
            placeholder="Search components..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-border bg-card pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
                activeCategory === cat
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              }`}
            >
              {cat}
              {cat !== 'All' && (
                <span className="ml-1.5 opacity-60">
                  {components.filter((c) => c.category === cat).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-muted-foreground">
        Showing {filtered.length} of {components.length} components
      </p>

      {/* Component grid grouped by category */}
      {Object.entries(groupedByCategory).map(([category, items]) => (
        <div key={category} className="space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              {category}
            </h2>
            <div className="h-px flex-1 bg-border" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {items.map((component) => (
              <Link
                key={component.href}
                href={component.href}
                className="group relative rounded-xl border border-border bg-card p-5 transition-all duration-200 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 mb-2">
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        {component.name}
                      </h3>
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ring-inset ${categoryColors[component.category] || ''}`}>
                        {component.category}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                      {component.description}
                    </p>
                  </div>
                  <svg className="h-4 w-4 shrink-0 text-muted-foreground/30 transition-all group-hover:text-primary group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}

      {filtered.length === 0 && (
        <div className="py-16 text-center">
          <p className="text-muted-foreground">No components match your search.</p>
          <button
            onClick={() => { setSearch(''); setActiveCategory('All') }}
            className="mt-2 text-sm text-primary hover:underline"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  )
}
