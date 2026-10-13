import { HierarchyCanvasExample } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'
const props = [
  { name: 'items', type: 'HierarchyItem[]', description: 'Visible forest of unique, nonempty IDs and optional parent IDs. Every referenced parent must be included. Invalid parents and cycles throw.' },
  { name: 'orientation', type: "'vertical' | 'horizontal'", description: 'Top-down or left-to-right layout.' },
  { name: 'renderItem', type: '(id: string) => ReactNode', description: 'Real DOM card content, rendered in input order. Each card fills the geometry slot.' },
  { name: 'scale', type: 'number', default: '1', description: 'Positive finite visual scale. Scrolling remains native.' },
  { name: 'geometry', type: 'Partial<HierarchyGeometry>', description: 'Card width (248), height (164), sibling gap (24), level gap (64), and padding (24), in pixels. Dimensions must be positive; gaps and padding must be nonnegative.' },
  { name: 'ref / className / style', type: 'HTMLDivElement / string / CSSProperties', description: 'Ref and DOM attributes target the scroll viewport. Override its default min(68vh, 680px) height and 360px minimum with style.' },
]
const usage = `import { HierarchyCanvas, Card } from '@refraction-ui/react'

<HierarchyCanvas orientation="vertical"
  items={[{ id: 'Product' }, { id: 'Design', parentId: 'Product' }]}
  aria-label="Teams" role="group"
  renderItem={(id) => <Card className="h-full p-4">{id}</Card>}
/>`
export default function HierarchyCanvasPage() {
  return <div className="space-y-10">
    <div><h1 className="text-3xl font-bold text-foreground">Hierarchy Canvas</h1>
      <p className="mt-3 text-lg text-muted-foreground">A scrollable hierarchy of real DOM cards with orthogonal connectors and two directions.</p></div>
    <HierarchyCanvasExample />
    <section className="space-y-3"><h2 className="text-xl font-semibold">Installation (React)</h2><InstallCommand packageName="@refraction-ui/react" /></section>
    <section className="space-y-3"><h2 className="text-xl font-semibold">Usage</h2><CodeBlock frameworks={{ react: usage }} /></section>
    <section className="space-y-3"><h2 className="text-xl font-semibold">Interaction and accessibility</h2>
      <p>The canvas owns layout and scrolling. The caller owns expansion, selection, labels and keyboard navigation. Pass only visible items, retaining each visible parent. Choose ordinary DOM controls or a complete tree interaction pattern; the canvas does not impose tree semantics.</p>
      <p>The first root is centered when the layout changes. A focused descendant remains visible instead. SVG connectors are decorative. DOM order follows the supplied items. Choose card dimensions large enough for your content, including translated labels and zoomed text; an outline can be a useful alternative on narrow screens.</p>
    </section>
    <section><h2 className="mb-4 text-xl font-semibold">Props</h2><PropsTable props={props} /></section>
  </div>
}
