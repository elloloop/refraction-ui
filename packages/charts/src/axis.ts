import type { LinearScale, BandScale, TimeScale } from './scales.js'

type AnyScale = LinearScale | BandScale | TimeScale

export function generateTicks(
  scale: AnyScale,
  count?: number,
): (number | string | Date)[] {
  if (scale.type === 'band') {
    return scale.domain
  }
  if (scale.type === 'time') {
    return scale.ticks(count)
  }
  // linear
  return scale.ticks(count)
}

export function formatTick(
  value: number | string | Date,
  type: 'number' | 'date' | 'string',
): string {
  if (type === 'string') {
    return String(value)
  }

  if (type === 'date') {
    if (value instanceof Date) {
      return value.toISOString().split('T')[0]
    }
    return String(value)
  }

  // type === 'number'
  const num = value as number
  if (!Number.isFinite(num)) return String(num)

  // Check if integer
  if (Number.isInteger(num)) {
    // Format with locale separators for large numbers
    return num.toLocaleString('en-US', { maximumFractionDigits: 0 })
  }

  // Decimal: show up to 2 decimal places, strip trailing zeros
  const formatted = num.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })
  return formatted
}
