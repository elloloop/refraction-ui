---
id: PKG-BLOCKS
track: packages
depends_on: ["PKG-REACT"]
size: XL
labels: [feat]
status: pending
---

## Summary

Create `@elloloop/blocks` package — interactive block renderers, a canvas-based block engine, and 3D components. Extracted from elloloop/learnloop's tutoring system. These are highly reusable visual/interactive components for educational, diagramming, and data visualization use cases.

## Source References

### Block Renderers (26+ components)
All from **elloloop/learnloop** `components/tutoring/blocks/`:

| Renderer | File | Description |
|----------|------|-------------|
| BlockRegistry | `BlockRegistry.tsx` | Central `renderBlock()` dispatch for 26+ types |
| TextBlock | `TextBlockRenderer.tsx` | Text with inline markdown + character animation |
| MathBlock | `MathBlockRenderer.tsx` | Custom LaTeX-to-React renderer (no external deps) |
| NumberLine | `NumberLineRenderer.tsx` | SVG number line with tick marks, jump arcs |
| FractionDiagram | `FractionDiagramRenderer.tsx` | Circle or bar fraction diagrams |
| FractionWall | `FractionWallRenderer.tsx` | SVG fraction wall showing equivalents |
| BarModel | `BarModelRenderer.tsx` | SVG bar models with segments, braces |
| Grid | `GridRenderer.tsx` | Configurable grid with colored cells |
| ArrayDots | `ArrayDotsRenderer.tsx` | Rows x cols array of dots with grouping |
| TenFrame | `TenFrameRenderer.tsx` | 10-frame / 20-frame with colored dots |
| PlaceValueChart | `PlaceValueChartRenderer.tsx` | Place value columns (ones/tens/hundreds) |
| PieChart | `PieChartRenderer.tsx` | SVG pie chart with segments, labels, legend |
| CoordinateGrid | `CoordinateGridRenderer.tsx` | SVG coordinate grid with points, lines, regions |
| GeometricShape | `GeometricShapeRenderer.tsx` | SVG shapes (circle, square, triangle, polygon, compound) |
| AlgebraTiles | `AlgebraTilesRenderer.tsx` | Color-coded algebra tiles |
| EquationSteps | `EquationStepsRenderer.tsx` | Step-by-step equation solving with annotations |
| Table | `TableRenderer.tsx` | HTML table with highlighted cells |
| PartitionTable | `PartitionTableRenderer.tsx` | Grid/long multiplication partition table |
| Callout | `CalloutRenderer.tsx` | Styled callout boxes (tip/key_point/remember/warning) |
| Grouping | `GroupingRenderer.tsx` | Layout container (row/column/side_by_side/grid_2x2) |
| WorkedExample | `WorkedExampleRenderer.tsx` | Numbered worked example steps |
| Image | `ImageRenderer.tsx` | Image with alt text, lazy loading, caption |
| GapFill | `GapFillRenderer.tsx` | Inline fill-in-the-blank inputs |
| DragDrop | `DragDropRenderer.tsx` | Tap-to-select + tap-target interactions |
| MultipleChoice | `MultipleChoiceRenderer.tsx` | Radio-style with keyboard nav |
| FreeResponse | `FreeResponseRenderer.tsx` | Text input with validation, hints |
| HandwrittenText | `HandwrittenText.tsx` | Character-by-character text reveal |
| SketchyFilter | `SketchyFilter.tsx` | SVG filter for hand-drawn appearance |

### Block Engine
From **elloloop/learnloop** `lib/blocks/`:
- `block-engine.ts` — Canvas-based engine: pointer events, snapping, undo/redo, rendering
- `block-timeline.ts` — Timeline state machine for step-by-step reveals
- `snap.ts` — Value snapping utilities
- `undo.ts` — Undo/redo stack
- `pointer.ts` — Unified mouse+touch handling
- `handler-registry.ts` — Handler registration system
- `handlers/` — 18 interactive block handlers (algebra-tiles, balance-scale, clock, etc.)

### 3D Components (react-three-fiber)
From **elloloop/learnloop** `components/blocks/three/`:
- `ThreeCanvas.tsx` — Shared Canvas wrapper with lighting, controls, shadows
- `Cube3D.tsx` — Interactive cube with face labels and auto-rotation
- `Cuboid3D.tsx` — Adjustable-dimension cuboid
- `Prism3D.tsx` — Triangular prism, square pyramid, tetrahedron
- `RoundShapes3D.tsx` — Cylinder, cone, sphere with cross-section slice
- `CoordinateSystem3D.tsx` — 3D coordinate axes with point placement
- `GraphSurface3D.tsx` — `z = f(x,y)` surface renderer
- `Transformation3D.tsx` — Interactive translate/rotate/reflect transforms

### Canvas Animation
From **elloloop/learnloop** `lib/canvas/`:
- `whiteboard-engine.ts` — 60fps canvas char-by-char text animation with marker cursor
- `text-layout.ts` — Pure function text measurement with word wrapping

## Acceptance Criteria

- [ ] All 26+ block renderers exported and functional
- [ ] BlockRegistry dispatches to correct renderer by type
- [ ] Block engine supports pointer events, snapping, undo/redo
- [ ] Timeline system supports step-by-step animated reveals
- [ ] All 8 3D components render correctly (lazy-loaded, SSR-disabled)
- [ ] Whiteboard animation engine renders at 60fps
- [ ] All renderers support theming via CSS custom properties
- [ ] TypeScript strict types for all block types and props
- [ ] Unit tests for engine, timeline, snap, undo modules
- [ ] Storybook stories for each renderer type

## Package Structure

```
packages/blocks/
  src/
    renderers/       # 26+ block renderers
    engine/          # Block engine, pointer, snap, undo, timeline
    handlers/        # 18 interactive block handlers
    three/           # 3D components (react-three-fiber)
    canvas/          # Whiteboard animation engine
    registry.ts      # Central block type dispatch
    index.ts
```

## Dependencies

- `@react-three/fiber`, `@react-three/drei`, `three` (peer, for 3D)
- `@elloloop/react` (for base primitives)
