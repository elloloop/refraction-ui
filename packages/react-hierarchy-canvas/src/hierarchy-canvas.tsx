'use client';
import { forwardRef, useEffect, useMemo, useRef, type HTMLAttributes, type ReactNode } from 'react';
import {
  hierarchyLayout,
  type HierarchyGeometry,
  type HierarchyItem,
  type HierarchyOrientation,
} from '@refraction-ui/hierarchy-canvas';

export interface HierarchyCanvasProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  items: HierarchyItem[];
  orientation: HierarchyOrientation;
  scale?: number;
  geometry?: Partial<HierarchyGeometry>;
  renderItem: (id: string) => ReactNode;
}
export const HierarchyCanvas = forwardRef<HTMLDivElement, HierarchyCanvasProps>(
  function HierarchyCanvas(
    { items, orientation, scale = 1, geometry, renderItem, className = '', ...props },
    forwardedRef,
  ) {
    const viewport = useRef<HTMLDivElement | null>(null);
    const anchors = useRef(new Map<string, HTMLDivElement>());
    const layout = useMemo(
      () => hierarchyLayout(items, orientation, geometry),
      [items, orientation, geometry],
    );
    const rootId = items.find((item) => !item.parentId)?.id;
    const signature = JSON.stringify(items.map((item) => [item.id, item.parentId]));
    useEffect(() => {
      const panel = viewport.current;
      const anchor = rootId ? anchors.current.get(rootId) : undefined;
      if (!panel || !anchor) return;
      const active = document.activeElement;
      if (active instanceof HTMLElement && panel.contains(active)) {
        const card = active.closest('[data-hierarchy-node]');
        (card ?? active).scrollIntoView({ block: 'nearest', inline: 'nearest' });
        return;
      }
      const bounds = panel.getBoundingClientRect();
      const node = anchor.getBoundingClientRect();
      panel.scrollLeft =
        orientation === 'vertical'
          ? panel.scrollLeft + node.left + node.width / 2 - bounds.left - bounds.width / 2
          : 0;
      panel.scrollTop =
        orientation === 'horizontal'
          ? panel.scrollTop + node.top + node.height / 2 - bounds.top - bounds.height / 2
          : 0;
    }, [rootId, signature, orientation, scale, layout.width, layout.height]);
    if (!Number.isFinite(scale) || scale <= 0) throw new Error('Hierarchy scale must be positive');
    const { width, height } = layout.geometry;
    return (
      <div
        {...props}
        ref={(element) => {
          viewport.current = element;
          if (typeof forwardedRef === 'function') forwardedRef(element);
          else if (forwardedRef) forwardedRef.current = element;
        }}
        className={`relative w-full overflow-auto overscroll-contain ${className}`}
        style={{ height: 'min(68vh, 680px)', minHeight: 360, ...props.style }}
      >
        <div
          style={{
            position: 'relative',
            width: layout.width * scale,
            height: layout.height * scale,
            minWidth: '100%',
            minHeight: '100%',
          }}
        >
          <div
            style={{
              position: 'absolute',
              width: layout.width,
              height: layout.height,
              left: `max(0px, calc((100% - ${layout.width * scale}px) / 2))`,
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
            }}
          >
            <svg
              aria-hidden="true"
              width={layout.width}
              height={layout.height}
              className="pointer-events-none absolute inset-0 text-muted-foreground/50"
            >
              {layout.edges.map((edge) => (
                <path
                  key={edge.to}
                  d={edge.path}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
              ))}
            </svg>
            {items.map(({ id }) => {
              const point = layout.positions.get(id);
              if (!point) return null;
              return (
                <div
                  key={id}
                  ref={(element) => {
                    if (element) anchors.current.set(id, element);
                    else anchors.current.delete(id);
                  }}
                  data-hierarchy-node={id}
                  style={{ position: 'absolute', left: point.x, top: point.y, width, height }}
                >
                  {renderItem(id)}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  },
);
