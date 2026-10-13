export type HierarchyOrientation = 'vertical' | 'horizontal';
export interface HierarchyItem {
  id: string;
  parentId?: string;
}
export interface HierarchyPosition {
  id: string;
  x: number;
  y: number;
}
export interface HierarchyEdge {
  from: string;
  to: string;
  path: string;
}
export interface HierarchyGeometry {
  width: number;
  height: number;
  siblingGap: number;
  levelGap: number;
  padding: number;
}
export const HIERARCHY_GEOMETRY: HierarchyGeometry = {
  width: 248,
  height: 164,
  siblingGap: 24,
  levelGap: 64,
  padding: 24,
};

function indexHierarchy(items: HierarchyItem[]) {
  const byId = new Map(items.map((item) => [item.id, item]));
  if (items.some((item) => !item.id)) throw new Error('Hierarchy IDs must not be empty');
  if (byId.size !== items.length) throw new Error('Hierarchy IDs must be unique');
  const children = new Map<string, HierarchyItem[]>();
  for (const item of items) {
    if (item.parentId && !byId.has(item.parentId)) throw new Error('Hierarchy parent is missing');
    const list = children.get(item.parentId ?? '') ?? [];
    list.push(item);
    children.set(item.parentId ?? '', list);
  }
  return children;
}

/** A forest of stable IDs; invalid parent references and cycles are rejected. */
export function hierarchyLayout(
  items: HierarchyItem[],
  orientation: HierarchyOrientation,
  overrides?: Partial<HierarchyGeometry>,
) {
  const geometry = { ...HIERARCHY_GEOMETRY, ...overrides };
  validateGeometry(geometry);
  const { width, height, siblingGap, levelGap, padding } = geometry;
  const children = indexHierarchy(items);
  const positions: HierarchyPosition[] = [];
  const placed = new Set<string>();
  let leaf = 0;
  const crossStep = (orientation === 'vertical' ? width : height) + siblingGap;
  const levelStep = (orientation === 'vertical' ? height : width) + levelGap;
  const place = (item: HierarchyItem, depth: number): number => {
    if (placed.has(item.id)) throw new Error('Hierarchy contains a cycle');
    placed.add(item.id);
    const reports = children.get(item.id) ?? [];
    const centers = reports.map((child) => place(child, depth + 1));
    const cross = centers.length
      ? (centers[0] + centers[centers.length - 1]) / 2
      : leaf++ * crossStep;
    positions.push({
      id: item.id,
      x: padding + (orientation === 'vertical' ? cross : depth * levelStep),
      y: padding + (orientation === 'vertical' ? depth * levelStep : cross),
    });
    return cross;
  };
  for (const root of children.get('') ?? []) place(root, 0);
  if (placed.size !== items.length) throw new Error('Hierarchy contains a cycle');
  const coordinates = new Map(positions.map((position) => [position.id, position]));
  const edges = hierarchyEdges(items, coordinates, orientation, geometry);
  return {
    geometry,
    positions: coordinates,
    edges,
    width: Math.max(0, ...positions.map((position) => position.x + width)) + padding,
    height: Math.max(0, ...positions.map((position) => position.y + height)) + padding,
  };
}

function hierarchyEdges(
  items: HierarchyItem[],
  coordinates: Map<string, HierarchyPosition>,
  orientation: HierarchyOrientation,
  geometry: HierarchyGeometry,
) {
  const { width, height, levelGap } = geometry;
  const edges: HierarchyEdge[] = [];
  for (const item of items) {
    const parent = coordinates.get(item.parentId ?? '');
    const child = coordinates.get(item.id);
    if (!parent || !child) continue;
    const path =
      orientation === 'vertical'
        ? `M ${parent.x + width / 2} ${parent.y + height} V ${parent.y + height + levelGap / 2} H ${child.x + width / 2} V ${child.y}`
        : `M ${parent.x + width} ${parent.y + height / 2} H ${parent.x + width + levelGap / 2} V ${child.y + height / 2} H ${child.x}`;
    edges.push({ from: parent.id, to: child.id, path });
  }
  return edges;
}

function validateGeometry(geometry: HierarchyGeometry) {
  if (
    Object.values(geometry).some((value) => !Number.isFinite(value) || value < 0) ||
    !geometry.width ||
    !geometry.height
  ) {
    throw new Error('Hierarchy dimensions must be positive and gaps nonnegative');
  }
}
