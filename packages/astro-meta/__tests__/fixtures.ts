/**
 * Fixture table for the adapter smoke suite (`smoke.test.ts`).
 *
 * Every `astro-*` adapter's primary component is rendered with minimal
 * sensible props via the Astro Container API. Most components render fine with
 * zero props (headless cores supply defaults); this table covers everything
 * that deviates from that default:
 *
 * - `props` — components whose required props have no defaults.
 * - `expectSlotContent` — components whose contract includes rendering the
 *   default slot (verified against real render output).
 * - `placeholders` — intentional placeholder components (a bare wrapper div
 *   or less); they can only be asserted to render without throwing.
 * - `componentOverrides` — pin a different primary `.astro` file than the
 *   namesake/first rule in `harness.discoverPrimaries`.
 */

/** Components with required props (no core defaults) + their minimal values. */
export const PROPS: Record<string, Record<string, unknown>> = {
  'astro-animated-text': { words: ['Alpha', 'Beta'] },
  'astro-audio-room': { participants: [{ id: 'p1', name: 'Alice' }] },
  'astro-avatar-group': {
    users: [{ name: 'Alice', src: 'https://example.com/alice.jpg' }],
  },
  'astro-browser-chrome-mock': { url: 'https://example.com/docs/guide' },
  'astro-checklist': { items: [{ id: '1', label: 'Task one' }] },
  'astro-data-table': {
    columns: [
      { id: 'id', header: 'ID', accessor: (row: Record<string, unknown>) => row.id },
      { id: 'name', header: 'Name', accessor: (row: Record<string, unknown>) => row.name },
    ],
    data: [{ id: 1, name: 'Alice' }],
  },
  'astro-device-frame': { device: 'iphone' },
  'astro-diff-viewer': {
    files: [
      { path: 'src/a.js', status: 'modified', additions: 1, deletions: 1 },
    ],
  },
  'astro-editor-tabs': {
    tabs: [{ id: '1', label: 'index.ts' }],
    activeId: '1',
  },
  'astro-flow-editor': {
    nodes: [{ id: 'n1', x: 0, y: 0, label: 'Start' }],
    edges: [],
  },
  'astro-graph-view': {
    nodes: [{ id: 'n1', x: 0, y: 0, label: 'A' }],
    edges: [],
  },
  'astro-kanban-board': {
    columns: [{ id: 'todo', title: 'Todo' }],
    cards: [{ columnId: 'todo', title: 'Task' }],
  },
  'astro-language-selector': {
    options: [{ label: 'English', value: 'en' }],
  },
  'astro-live-captions': { cues: [{ id: '1', text: 'Hello world' }] },
  'astro-live-cursors': { cursors: [{ id: '1', name: 'Alice', x: 10, y: 10 }] },
  'astro-live-transcript': {
    entries: [{ id: '1', speaker: 'Alice', text: 'Hi' }],
  },
  'astro-markdown-renderer': { content: '# Hello' },
  'astro-marquee-strip': { items: ['One', 'Two'] },
  'astro-mini-map': { items: [{ id: '1', x: 0, y: 0 }] },
  'astro-numbered-steps': { items: [{ title: 'Step one', body: 'Do it' }] },
  'astro-pricing-card': {
    name: 'Pro',
    price: '$29',
    features: ['Everything'],
    cta: 'Buy now',
  },
  'astro-slide-viewer': {
    slides: [{ id: 's1', type: 'lesson', content: 'First slide' }],
  },
  'astro-slot-picker': {
    days: [{ id: 'd1', weekday: 'Fri', dayNum: 14 }],
    slotsByDay: { d1: ['10:00'] },
  },
  'astro-sortable-list': { items: [{ id: '1', label: 'One' }] },
  'astro-stat-grid': { items: [{ value: '10k+', label: 'Users' }] },
  'astro-terminal': { lines: [{ kind: 'command', text: 'ls -la' }] },
  'astro-test-results': {
    results: [{ id: '1', name: 'smoke test', status: 'pass' }],
  },
  'astro-timeline': { items: [{ id: '1', title: 'Event one' }] },
  'astro-version-selector': {
    versions: [{ value: '1.0.0', label: 'v1.0.0', isLatest: true }],
  },
  'astro-video-grid': { participants: [{ id: 'p1', name: 'Alice' }] },
  'astro-video-tile': { name: 'Alice' },
  'astro-wizard': { steps: [{ id: 's1', label: 'Step one' }] },
}

/**
 * Components whose SSR contract includes rendering the default slot. Verified
 * against real render output — a component lands here only if it actually
 * rendered slot content. (Prop-driven components — inputs, charts, scripts —
 * have no slot and are not flagged; that is correct behavior, not a gap.)
 */
export const EXPECT_SLOT_CONTENT = new Set([
  'astro-accordion',
  'astro-app-shell',
  'astro-audience-feature-card',
  'astro-auth',
  'astro-avatar',
  'astro-badge',
  'astro-button',
  'astro-call-controls',
  'astro-callout',
  'astro-card',
  'astro-card-grid',
  'astro-carousel',
  'astro-code-block',
  'astro-collapsible',
  'astro-command',
  'astro-command-input',
  'astro-composer',
  'astro-content-protection',
  'astro-dialog',
  'astro-dropdown-menu',
  'astro-file-upload',
  'astro-infinite-canvas',
  'astro-input-group',
  'astro-link-card',
  'astro-mobile-nav',
  'astro-popover',
  'astro-radio',
  'astro-resizable-layout',
  'astro-search-bar',
  'astro-section-head',
  'astro-segmented-control',
  'astro-select',
  'astro-separator',
  'astro-sticky-note',
  'astro-tabs',
  'astro-toast',
  'astro-tooltip',
])

/**
 * Intentional placeholder components — a bare `<div></div>` (or wrapper with a
 * class hook) is their entire current implementation. Asserted to render
 * without throwing; a marker assertion would be meaningless.
 */
export const PLACEHOLDERS = new Set([
  'astro-file-tree',
  'astro-icon-system',
  'astro-pagination',
  'astro-skip-to-content',
  'astro-steps',
])

/** Pin a different primary component than the namesake/first-file rule. */
export const COMPONENT_OVERRIDES: Record<string, string> = {
  // First file alphabetically is `Bars.astro`, but `Chart.astro` is the
  // actual chart wrapper consumers start from.
  'astro-charts': 'Chart.astro',
}
