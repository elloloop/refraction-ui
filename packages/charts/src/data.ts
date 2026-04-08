export interface HistogramBin {
  x0: number
  x1: number
  count: number
}

export function computeExtent(data: number[]): [number, number] {
  let min = data[0]
  let max = data[0]
  for (let i = 1; i < data.length; i++) {
    if (data[i] < min) min = data[i]
    if (data[i] > max) max = data[i]
  }
  return [min, max]
}

export function computeMean(data: number[]): number {
  let sum = 0
  for (let i = 0; i < data.length; i++) {
    sum += data[i]
  }
  return sum / data.length
}

export function computeHistogramBins(
  data: number[],
  binCount?: number,
): HistogramBin[] {
  const count = binCount ?? Math.ceil(Math.sqrt(data.length))
  const [min, max] = computeExtent(data)
  const span = max - min

  // Handle case where all values are the same
  if (span === 0) {
    const bins: HistogramBin[] = []
    for (let i = 0; i < count; i++) {
      bins.push({ x0: min, x1: max, count: 0 })
    }
    // Put all items in the first bin
    bins[0].count = data.length
    return bins
  }

  const binWidth = span / count
  const bins: HistogramBin[] = []
  for (let i = 0; i < count; i++) {
    bins.push({
      x0: min + i * binWidth,
      x1: min + (i + 1) * binWidth,
      count: 0,
    })
  }

  for (const value of data) {
    let idx = Math.floor((value - min) / binWidth)
    // Values at the max boundary go into the last bin
    if (idx >= count) idx = count - 1
    bins[idx].count++
  }

  return bins
}

export function normalizeData<T>(
  data: T[],
  accessor: string | ((d: T) => unknown),
): unknown[] {
  if (typeof accessor === 'string') {
    return data.map((d) => (d as Record<string, unknown>)[accessor])
  }
  return data.map(accessor)
}
