import { describe, it, expect } from 'vitest'
import {
  createPagination,
  clampPage,
  getPaginationItems,
  type PaginationItem,
} from '../src/index.js'

const pages = (items: PaginationItem[]) =>
  items.map((i) => (i.type === 'page' ? i.page : '…'))

describe('clampPage', () => {
  it('clamps into [1, total]', () => {
    expect(clampPage(0, 10)).toBe(1)
    expect(clampPage(-3, 10)).toBe(1)
    expect(clampPage(11, 10)).toBe(10)
    expect(clampPage(5, 10)).toBe(5)
  })

  it('treats a non-positive total as 1', () => {
    expect(clampPage(7, 0)).toBe(1)
    expect(clampPage(7, -2)).toBe(1)
  })
})

describe('getPaginationItems', () => {
  it('returns every page when the total fits without ellipses', () => {
    expect(pages(getPaginationItems(3, 5))).toEqual([1, 2, 3, 4, 5])
    expect(pages(getPaginationItems(4, 7))).toEqual([1, 2, 3, 4, 5, 6, 7])
  })

  it('returns nothing for a zero total', () => {
    expect(getPaginationItems(1, 0)).toEqual([])
  })

  it('truncates the end when the current page is near the start', () => {
    expect(pages(getPaginationItems(1, 10))).toEqual([1, 2, 3, 4, 5, '…', 10])
    expect(pages(getPaginationItems(3, 10))).toEqual([1, 2, 3, 4, 5, '…', 10])
  })

  it('truncates the start when the current page is near the end', () => {
    expect(pages(getPaginationItems(10, 10))).toEqual([1, '…', 6, 7, 8, 9, 10])
    expect(pages(getPaginationItems(8, 10))).toEqual([1, '…', 6, 7, 8, 9, 10])
  })

  it('truncates both sides around a middle page', () => {
    expect(pages(getPaginationItems(5, 10))).toEqual([1, '…', 4, 5, 6, '…', 10])
  })

  it('honors a wider siblingCount', () => {
    expect(pages(getPaginationItems(6, 12, 2))).toEqual([1, '…', 4, 5, 6, 7, 8, '…', 12])
  })

  it('clamps an out-of-range current page', () => {
    expect(pages(getPaginationItems(99, 10))).toEqual([1, '…', 6, 7, 8, 9, 10])
    expect(pages(getPaginationItems(-4, 10))).toEqual([1, 2, 3, 4, 5, '…', 10])
  })
})

describe('createPagination', () => {
  it('exposes navigation role and data attributes', () => {
    const api = createPagination({ page: 2, totalPages: 5 })
    expect(api.ariaProps.role).toBe('navigation')
    expect(api.ariaProps['aria-label']).toBe('Pagination')
    expect(api.dataAttributes['data-page']).toBe('2')
    expect(api.dataAttributes['data-total-pages']).toBe('5')
  })

  it('computes prev/next edges', () => {
    const first = createPagination({ page: 1, totalPages: 5 })
    expect(first.canGoPrevious).toBe(false)
    expect(first.canGoNext).toBe(true)
    expect(first.previousPage).toBe(1)
    expect(first.nextPage).toBe(2)

    const last = createPagination({ page: 5, totalPages: 5 })
    expect(last.canGoPrevious).toBe(true)
    expect(last.canGoNext).toBe(false)
    expect(last.previousPage).toBe(4)
    expect(last.nextPage).toBe(5)
  })

  it('marks only the current page with aria-current', () => {
    const api = createPagination({ page: 3, totalPages: 5 })
    expect(api.getPageAria(3)['aria-current']).toBe('page')
    expect(api.getPageAria(2)['aria-current']).toBeUndefined()
  })

  it('labels the prev/next controls', () => {
    const api = createPagination({ page: 1, totalPages: 1 })
    expect(api.getPreviousAria()['aria-label']).toBe('Previous page')
    expect(api.getNextAria()['aria-label']).toBe('Next page')
    expect(api.canGoPrevious).toBe(false)
    expect(api.canGoNext).toBe(false)
  })
})
