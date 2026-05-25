import * as React from 'react'
import * as Pkg from './index.js'

// Auto-generated baseline story. Renders the primary component with no props;
// components that require props show a graceful card (enrich by hand as needed).
const COMPONENT = 'Sheet'
const exported = Pkg as Record<string, unknown>
const Cmp = (exported[COMPONENT] ??
  Object.values(exported).find(
    (v) => typeof v === 'function' || (v !== null && typeof v === 'object' && '$$typeof' in (v as object)),
  )) as React.ComponentType<Record<string, unknown>> | undefined

class Boundary extends React.Component<{ children: React.ReactNode }, { err: boolean }> {
  state = { err: false }
  static getDerivedStateFromError() {
    return { err: true }
  }
  render() {
    if (this.state.err) {
      return (
        <div className="rounded-md border border-dashed border-border p-6 text-sm text-muted-foreground">
          <strong>{COMPONENT}</strong> needs props to preview. See the docs site for a full example.
        </div>
      )
    }
    return this.props.children
  }
}

export default { title: 'Components/Sheet' }

export const Default = {
  render: () => (
    <div className="p-6">
      <Boundary>{Cmp ? <Cmp /> : <em className="text-muted-foreground">No renderable export found.</em>}</Boundary>
    </div>
  ),
}
