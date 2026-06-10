'use client'

import { useState } from 'react'
import { Pagination } from '@refraction-ui/react-pagination'

interface PaginationExamplesProps {
  section: 'basic' | 'range'
}

export function PaginationExamples({ section }: PaginationExamplesProps) {
  if (section === 'basic') {
    return <BasicExample />
  }

  if (section === 'range') {
    return <RangeExample />
  }

  return null
}

const buttonBase =
  'inline-flex h-9 min-w-9 items-center justify-center rounded-md border border-border bg-background px-3 text-sm font-medium transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-50'

function BasicExample() {
  const totalPages = 5
  const [page, setPage] = useState(1)

  return (
    <div className="rounded-xl border border-border bg-card p-8">
      <Pagination
        role="navigation"
        aria-label="Pagination"
        className="flex items-center gap-2"
      >
        <button className={buttonBase} disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
          Previous
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            aria-current={n === page ? 'page' : undefined}
            className={
              n === page
                ? `${buttonBase} border-primary bg-primary text-primary-foreground hover:bg-primary`
                : buttonBase
            }
            onClick={() => setPage(n)}
          >
            {n}
          </button>
        ))}
        <button
          className={buttonBase}
          disabled={page === totalPages}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </button>
      </Pagination>
    </div>
  )
}

function RangeExample() {
  const totalPages = 10
  const [page, setPage] = useState(4)
  const window = [page - 1, page, page + 1].filter((n) => n >= 1 && n <= totalPages)

  return (
    <div className="rounded-xl border border-border bg-card p-8">
      <Pagination role="navigation" aria-label="Pagination" className="flex items-center gap-2">
        <button className={buttonBase} disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
          Prev
        </button>
        {window[0] > 1 && (
          <>
            <button className={buttonBase} onClick={() => setPage(1)}>
              1
            </button>
            {window[0] > 2 && <span className="px-1 text-muted-foreground">…</span>}
          </>
        )}
        {window.map((n) => (
          <button
            key={n}
            aria-current={n === page ? 'page' : undefined}
            className={
              n === page
                ? `${buttonBase} border-primary bg-primary text-primary-foreground hover:bg-primary`
                : buttonBase
            }
            onClick={() => setPage(n)}
          >
            {n}
          </button>
        ))}
        {window[window.length - 1] < totalPages && (
          <>
            {window[window.length - 1] < totalPages - 1 && (
              <span className="px-1 text-muted-foreground">…</span>
            )}
            <button className={buttonBase} onClick={() => setPage(totalPages)}>
              {totalPages}
            </button>
          </>
        )}
        <button
          className={buttonBase}
          disabled={page === totalPages}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </button>
      </Pagination>
    </div>
  )
}
