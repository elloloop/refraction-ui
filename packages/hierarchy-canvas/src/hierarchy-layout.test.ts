import { describe, expect, it } from 'vitest';
import { hierarchyLayout, HIERARCHY_GEOMETRY } from './hierarchy-layout';
const items = [
  { id: 'root' },
  { id: 'a', parentId: 'root' },
  { id: 'b', parentId: 'root' },
  { id: 'c', parentId: 'a' },
  { id: 'd', parentId: 'a' },
  { id: 'other' },
];
describe('hierarchy layout', () => {
  for (const orientation of ['vertical', 'horizontal'] as const) {
    it(`connects each reporting edge without overlapping cards in ${orientation}`, () => {
      const layout = hierarchyLayout(items, orientation);
      expect(layout.positions.size).toBe(items.length);
      expect(layout.edges.map((edge) => [edge.from, edge.to])).toEqual([
        ['root', 'a'],
        ['root', 'b'],
        ['a', 'c'],
        ['a', 'd'],
      ]);
      const positions = [...layout.positions.values()];
      const { width, height } = HIERARCHY_GEOMETRY;
      for (let a = 0; a < positions.length; a++)
        for (let b = a + 1; b < positions.length; b++) {
          expect(
            Math.abs(positions[a].x - positions[b].x) >= width ||
              Math.abs(positions[a].y - positions[b].y) >= height,
          ).toBe(true);
        }
      const root = layout.positions.get('root');
      const child = layout.positions.get('a');
      if (!root || !child) throw new Error('Missing hierarchy cards');
      expect(orientation === 'vertical' ? child.y > root.y : child.x > root.x).toBe(true);
    });
  }
  it('rejects ambiguous IDs, missing parents and disconnected cycles', () => {
    expect(() => hierarchyLayout([{ id: 'a' }, { id: 'a' }], 'vertical')).toThrow('unique');
    expect(() => hierarchyLayout([{ id: 'a', parentId: 'missing' }], 'vertical')).toThrow(
      'missing',
    );
    expect(() =>
      hierarchyLayout(
        [
          { id: 'a', parentId: 'b' },
          { id: 'b', parentId: 'a' },
        ],
        'vertical',
      ),
    ).toThrow('cycle');
  });
  it('supports explicit card geometry and rejects invalid dimensions', () => {
    const geometry = { width: 180, height: 96, levelGap: 30, siblingGap: 10, padding: 12 };
    const layout = hierarchyLayout(
      [{ id: 'root' }, { id: 'child', parentId: 'root' }],
      'horizontal',
      geometry,
    );
    expect(layout.positions.get('child')?.x).toBe(222);
    expect(layout.width).toBe(414);
    expect(layout.height).toBe(120);
    for (const overrides of [{ width: 0 }, { height: -1 }, { padding: -1 }, { siblingGap: NaN }]) {
      expect(() => hierarchyLayout([], 'vertical', overrides)).toThrow('dimensions');
    }
    expect(hierarchyLayout([], 'vertical').positions.size).toBe(0);
  });
});
