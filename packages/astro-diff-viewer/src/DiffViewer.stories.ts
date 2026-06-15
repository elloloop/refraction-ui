import Component from './DiffViewer.astro'

const meta = {
  title: 'Astro/DiffViewer',
  component: Component,
}

export default meta

export const Default = {
  args: {
    files: [
      { name: 'example.js', original: 'const a = 1;', modified: 'const a = 2;' }
    ],
    original: 'const a = 1;',
    modified: 'const a = 2;',
    language: 'javascript',
    theme: 'dark',
    viewMode: 'split',
    showSidebar: false,
    showTabs: false,
    showStatusBar: false,
    sidebarWidth: 100,
    activeFileIndex: 0,
    statusBarTitle: 'Status',
    statusBarStatus: 'Ready'
  }
}
