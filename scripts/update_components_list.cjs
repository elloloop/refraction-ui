const fs = require('fs');
const path = require('path');

const pagePaths = [
  path.join(__dirname, '../packages/flutter-docs-site/src/app/components/page.tsx'),
  path.join(__dirname, '../docs-site/src/app/components/page.tsx')
];

const newComponents = [
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
  { name: 'Checklist', href: '/components/checklist', description: 'To-do list with interactive check states.', category: 'Forms' }
];

pagePaths.forEach(pagePath => {
  if (!fs.existsSync(pagePath)) return;
  let content = fs.readFileSync(pagePath, 'utf8');

  // Let's locate the components array
  const startStr = 'const components = [';
  const startIndex = content.indexOf(startStr);
  if (startIndex === -1) {
    console.error(`Could not find components array in ${pagePath}`);
    return;
  }

  let depth = 1;
  let i = startIndex + startStr.length;
  while (depth > 0 && i < content.length) {
    if (content[i] === '[') depth++;
    else if (content[i] === ']') depth--;
    i++;
  }

  // To avoid complex regex parsing of js objects, we can inject our new elements before the closing bracket of the array
  // Let's find the closing bracket of the array: the last character of arrayText should be ']'
  const closingIndex = i - 1; // index of ']' in content
  
  // Format the new components as strings to insert
  let insertion = '';
  newComponents.forEach(comp => {
    // Check if component already exists in page
    if (content.includes(`href: '${comp.href}'`)) {
      console.log(`Component ${comp.name} already exists in ${pagePath}`);
      return;
    }
    insertion += `\n  { name: '${comp.name}', href: '${comp.href}', description: '${comp.description}', category: '${comp.category}' },`;
  });

  if (insertion) {
    content = content.slice(0, closingIndex) + insertion + '\n' + content.slice(closingIndex);
    fs.writeFileSync(pagePath, content, 'utf8');
    console.log(`Updated ${pagePath}`);
  }
});
