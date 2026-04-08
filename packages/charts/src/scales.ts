// --- Linear Scale ---

export interface LinearScale {
  (value: number): number
  invert: (value: number) => number
  ticks: (count?: number) => number[]
  type: 'linear'
  domain: [number, number]
  range: [number, number]
}

export function createLinearScale(
  domain: [number, number],
  range: [number, number],
): LinearScale {
  const [d0, d1] = domain
  const [r0, r1] = range
  const domainSpan = d1 - d0
  const rangeSpan = r1 - r0

  const scale = ((value: number): number => {
    if (domainSpan === 0) return r0
    return r0 + ((value - d0) / domainSpan) * rangeSpan
  }) as LinearScale

  scale.invert = (value: number): number => {
    if (rangeSpan === 0) return d0
    return d0 + ((value - r0) / rangeSpan) * domainSpan
  }

  scale.ticks = (count = 10): number[] => {
    if (count <= 0) return []
    const ticks: number[] = []
    for (let i = 0; i < count; i++) {
      ticks.push(d0 + (domainSpan * i) / (count - 1 || 1))
    }
    return ticks
  }

  scale.type = 'linear'
  scale.domain = domain
  scale.range = range

  return scale
}

// --- Band Scale ---

export interface BandScale {
  (value: string): number
  bandwidth: () => number
  type: 'band'
  domain: string[]
  range: [number, number]
}

export function createBandScale(
  domain: string[],
  range: [number, number],
  padding = 0,
): BandScale {
  const [r0, r1] = range
  const rangeSpan = r1 - r0
  const n = domain.length

  // With padding: each step = bandwidth + paddingInner
  // total = n * step - paddingInner (no padding after last band)
  // paddingInner = step * padding
  // step * n - step * padding = rangeSpan => step * (n - padding) = rangeSpan
  let step = 0
  let bw = 0

  if (n > 0) {
    if (n === 1) {
      bw = rangeSpan
      step = rangeSpan
    } else {
      step = n > 0 ? rangeSpan / (n - padding) : 0
      bw = step * (1 - padding)
    }
  }

  const indexMap = new Map<string, number>()
  domain.forEach((d, i) => indexMap.set(d, i))

  const scale = ((value: string): number => {
    const idx = indexMap.get(value)
    if (idx === undefined) return 0
    return r0 + idx * step
  }) as BandScale

  scale.bandwidth = (): number => {
    return Math.max(0, bw)
  }

  scale.type = 'band'
  scale.domain = domain
  scale.range = range

  return scale
}

// --- Time Scale ---

export interface TimeScale {
  (value: Date): number
  invert: (value: number) => Date
  ticks: (count?: number) => Date[]
  type: 'time'
  domain: [Date, Date]
  range: [number, number]
}

export function createTimeScale(
  domain: [Date, Date],
  range: [number, number],
): TimeScale {
  const [d0, d1] = domain
  const [r0, r1] = range
  const t0 = d0.getTime()
  const t1 = d1.getTime()
  const domainSpan = t1 - t0
  const rangeSpan = r1 - r0

  const scale = ((value: Date): number => {
    if (domainSpan === 0) return r0
    return r0 + ((value.getTime() - t0) / domainSpan) * rangeSpan
  }) as TimeScale

  scale.invert = (value: number): Date => {
    if (rangeSpan === 0) return new Date(t0)
    const t = t0 + ((value - r0) / rangeSpan) * domainSpan
    return new Date(t)
  }

  scale.ticks = (count = 10): Date[] => {
    if (count <= 0) return []
    const ticks: Date[] = []
    for (let i = 0; i < count; i++) {
      const t = t0 + (domainSpan * i) / (count - 1 || 1)
      ticks.push(new Date(t))
    }
    return ticks
  }

  scale.type = 'time'
  scale.domain = domain
  scale.range = range

  return scale
}
