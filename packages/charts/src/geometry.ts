export interface Point {
  x: number
  y: number
}

export function linePath(points: Point[]): string {
  if (points.length === 0) return ''
  let d = `M${points[0].x},${points[0].y}`
  for (let i = 1; i < points.length; i++) {
    d += `L${points[i].x},${points[i].y}`
  }
  return d
}

export function areaPath(points: Point[], baseline: number): string {
  if (points.length === 0) return ''
  // Forward path along points
  let d = `M${points[0].x},${points[0].y}`
  for (let i = 1; i < points.length; i++) {
    d += `L${points[i].x},${points[i].y}`
  }
  // Drop down to baseline, go back to start, close
  const last = points[points.length - 1]
  const first = points[0]
  d += `L${last.x},${baseline}`
  d += `L${first.x},${baseline}`
  d += 'Z'
  return d
}

export function arcPath(
  cx: number,
  cy: number,
  radius: number,
  startAngle: number,
  endAngle: number,
): string {
  const x1 = cx + radius * Math.cos(startAngle)
  const y1 = cy + radius * Math.sin(startAngle)
  const x2 = cx + radius * Math.cos(endAngle)
  const y2 = cy + radius * Math.sin(endAngle)

  const largeArcFlag = endAngle - startAngle > Math.PI ? 1 : 0

  // Round to avoid floating point noise in path string
  const r = (n: number) => Math.round(n * 1e6) / 1e6

  let d = `M${r(x1)},${r(y1)}`
  d += `A${radius},${radius} 0 ${largeArcFlag} 1 ${r(x2)},${r(y2)}`
  d += `L${cx},${cy}`
  d += 'Z'

  return d
}
