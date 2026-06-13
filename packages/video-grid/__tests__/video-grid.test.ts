import { describe, it, expect } from 'vitest'
import {
  computeGridColumns,
  bucketByCount,
  createVideoGrid,
} from '../src/index.js'

describe('computeGridColumns', () => {
  it('returns 1 column for solo participant', () => {
    expect(computeGridColumns(0)).toBe(1)
    expect(computeGridColumns(1)).toBe(1)
  })

  it('returns 2 columns for 2–4 participants', () => {
    expect(computeGridColumns(2)).toBe(2)
    expect(computeGridColumns(3)).toBe(2)
    expect(computeGridColumns(4)).toBe(2)
  })

  it('returns 3 columns for 5–9 participants', () => {
    expect(computeGridColumns(5)).toBe(3)
    expect(computeGridColumns(9)).toBe(3)
  })

  it('returns 4 columns for 10–16 participants', () => {
    expect(computeGridColumns(10)).toBe(4)
    expect(computeGridColumns(16)).toBe(4)
  })

  it('returns 5 columns for 17–25 participants', () => {
    expect(computeGridColumns(17)).toBe(5)
    expect(computeGridColumns(25)).toBe(5)
  })

  it('returns 6 columns for 26+ participants', () => {
    expect(computeGridColumns(26)).toBe(6)
    expect(computeGridColumns(100)).toBe(6)
  })
})

describe('bucketByCount', () => {
  it('labels solo and pair correctly', () => {
    expect(bucketByCount(0)).toBe('solo')
    expect(bucketByCount(1)).toBe('solo')
    expect(bucketByCount(2)).toBe('pair')
  })

  it('labels small meetings (3–9)', () => {
    expect(bucketByCount(3)).toBe('small')
    expect(bucketByCount(9)).toBe('small')
  })

  it('labels medium meetings (10–16)', () => {
    expect(bucketByCount(10)).toBe('medium')
    expect(bucketByCount(16)).toBe('medium')
  })

  it('labels large meetings (17–25)', () => {
    expect(bucketByCount(17)).toBe('large')
    expect(bucketByCount(25)).toBe('large')
  })

  it('labels townhall meetings (26+)', () => {
    expect(bucketByCount(26)).toBe('townhall')
    expect(bucketByCount(200)).toBe('townhall')
  })
})

describe('createVideoGrid', () => {
  it('defaults to role=group and layout=auto', () => {
    const { ariaProps, dataAttributes } = createVideoGrid()
    expect(ariaProps.role).toBe('group')
    expect(dataAttributes['data-layout']).toBe('auto')
  })

  it('reflects the requested layout in data-layout', () => {
    expect(createVideoGrid({ layout: 'grid' }).dataAttributes['data-layout']).toBe('grid')
    expect(createVideoGrid({ layout: 'speaker' }).dataAttributes['data-layout']).toBe('speaker')
  })
})
