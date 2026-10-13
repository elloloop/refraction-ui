"use client"
import { useState } from 'react'
import { HierarchyCanvas, type HierarchyOrientation } from '@refraction-ui/react-hierarchy-canvas'
import { Button } from '@refraction-ui/react-button'
import { Card } from '@refraction-ui/react-card'
import { NativeSelect } from '@refraction-ui/react-native-select'
const items = [
  { id: 'Product' },
  { id: 'Design', parentId: 'Product' },
  { id: 'Engineering', parentId: 'Product' },
  { id: 'Research', parentId: 'Design' },
  { id: 'Systems', parentId: 'Engineering' },
  { id: 'Applications', parentId: 'Engineering' },
]
export function HierarchyCanvasExample({ initialOrientation = 'vertical' }: { initialOrientation?: HierarchyOrientation }) {
  const [orientation, setOrientation] = useState(initialOrientation)
  const [scale, setScale] = useState(1)
  const [expanded, setExpanded] = useState(true)
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <label>Direction <NativeSelect aria-label="Hierarchy direction" value={orientation} onChange={(event) => setOrientation(event.target.value as HierarchyOrientation)}>
          <option value="vertical">Top-down</option><option value="horizontal">Left-to-right</option>
        </NativeSelect></label>
        <Button variant="outline" onClick={() => setScale(scale === 1 ? 0.8 : 1)}>{scale === 1 ? 'Zoom out' : 'Reset zoom'}</Button>
      </div>
      <HierarchyCanvas role="group" aria-label="Product organization" className="rounded-xl border border-border bg-background"
        orientation={orientation} scale={scale} items={expanded ? items : items.slice(0, 1)} geometry={{ height: 120 }}
        renderItem={(id) => <Card className="flex h-full flex-col justify-center gap-3 border-border bg-card p-4 text-card-foreground">
          <strong>{id}</strong>
          {id === 'Product' ? <Button variant="outline" size="sm" aria-expanded={expanded} onClick={() => setExpanded(!expanded)}>{expanded ? 'Collapse reports' : 'Expand reports'}</Button> : <span className="text-sm text-muted-foreground">Team</span>}
        </Card>} />
      <p className="text-sm text-muted-foreground">Scroll to explore. Cards remain real DOM content; this example keeps its controls in the normal tab order.</p>
    </div>
  )
}
