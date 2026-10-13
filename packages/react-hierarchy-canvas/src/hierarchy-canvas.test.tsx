import { describe, expect, it } from 'vitest'
import { renderToString } from 'react-dom/server'
import { HierarchyCanvas } from './hierarchy-canvas'
const items = [{ id: 'root' }, { id: 'child', parentId: 'root' }]

describe('HierarchyCanvas', () => {
  for (const orientation of ['vertical', 'horizontal'] as const) {
    it(`renders real content and decorative connectors in ${orientation}`, () => {
      const html = renderToString(<HierarchyCanvas items={items} orientation={orientation}
        role="group" aria-label="Organization" className="custom-canvas" style={{ height: 400 }}
        renderItem={(id) => <button>{id}</button>} />)
      expect(html).toContain('aria-label="Organization"')
      expect(html).toContain('custom-canvas')
      expect(html).toContain('height:400px')
      expect(html).toContain('<button>root</button>')
      expect(html).toContain('<button>child</button>')
      expect(html).toContain('aria-hidden="true"')
      expect(html.match(/<path /g)).toHaveLength(1)
    })
  }
  it('accepts empty forests and rejects invalid scale', () => {
    expect(renderToString(<HierarchyCanvas items={[]} orientation="vertical" renderItem={() => null} />)).not.toContain('<path ')
    for (const scale of [0, -1, Infinity, NaN]) {
      expect(() => renderToString(<HierarchyCanvas items={items} orientation="vertical" scale={scale} renderItem={() => null} />)).toThrow('scale')
    }
  })
})
