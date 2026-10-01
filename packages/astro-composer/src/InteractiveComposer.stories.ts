import Component from './InteractiveComposer.astro'
import ToolbarComposition from '../../astro-meta/__tests__/compositions/interactive-composer-toolbar.astro'
const meta = { title: 'Astro/Composer/Interactive', component: Component }
export default meta
export const Clipboard = { args: { defaultValue: 'Local fixture draft', placeholder: 'Paste text and PNG/JPEG images…' } }
export const ReadOnly = { args: { defaultValue: 'Selectable draft', readOnly: true } }
export const Disabled = { args: { disabled: true } }
export const Toolbar = { render: () => ({ Component: ToolbarComposition }) }
