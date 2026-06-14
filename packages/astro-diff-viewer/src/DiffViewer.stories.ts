import Component from './DiffViewer.astro'

const meta = {
  title: 'Astro/DiffViewer',
  component: Component,
}

export default meta

export const Default = {
  args: {
    files: undefined,
    original: 'Example original',
    modified: 'Example modified',
    language: 'Example language',
    theme: undefined,
    viewMode: undefined,
    showSidebar: false,
    showTabs: false,
    showStatusBar: false,
    sidebarWidth: 100,
    activeFileIndex: 42,
    statusBarTitle: 'Example statusBarTitle',
    statusBarStatus: 'Example statusBarStatus'
  }
}
