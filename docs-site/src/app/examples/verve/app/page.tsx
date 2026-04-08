'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ThemeConfigPanel } from '@/components/theme-config-panel'
import { verveConfig } from '../../theme-configs'
import { allProducts, categoriesFilter, priceRanges } from '../config'

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      <div className="flex gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <svg key={i} className={`h-3 w-3 ${i < Math.floor(rating) ? 'text-warning' : 'text-muted'}`} fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
      <span className="text-xs text-muted-foreground">{rating}</span>
    </div>
  )
}

export default function EcommerceProductListing() {
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [priceFilter, setPriceFilter] = useState('All')
  const [page, setPage] = useState(1)
  const perPage = 8

  const filtered = allProducts
    .filter((p) => categoryFilter === 'All' || p.category === categoryFilter)
    .filter((p) => {
      if (priceFilter === 'Under $50') return p.price < 50
      if (priceFilter === '$50 - $100') return p.price >= 50 && p.price <= 100
      if (priceFilter === 'Over $100') return p.price > 100
      return true
    })

  const totalPages = Math.ceil(filtered.length / perPage)
  const paginated = filtered.slice((page - 1) * perPage, page * perPage)

  return (
    <div className="">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-8 py-4 border-b border-border bg-background/80 backdrop-blur-sm">
        <Link href="/examples/verve" className="text-lg font-bold text-foreground tracking-tight">VERVE</Link>
        <div className="flex items-center gap-6">
          <span className="text-sm text-foreground font-medium">Shop</span>
          <Link href="/examples/verve/app/product" className="text-sm text-muted-foreground hover:text-foreground transition-colors">New In</Link>
          <Link href="/examples/verve/app/cart" className="relative text-muted-foreground hover:text-foreground transition-colors">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
            </svg>
            <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center">3</span>
          </Link>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar Filters */}
        <aside className="w-56 flex-shrink-0 border-r border-border p-6 space-y-6">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Category</h3>
            <div className="space-y-1.5">
              {categoriesFilter.map((cat) => (
                <button
                  key={cat}
                  onClick={() => { setCategoryFilter(cat); setPage(1) }}
                  className={`block w-full text-left px-2 py-1.5 rounded-[var(--radius)] text-sm transition-colors ${
                    categoryFilter === cat
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Price Range</h3>
            <div className="space-y-1.5">
              {priceRanges.map((range) => (
                <button
                  key={range}
                  onClick={() => { setPriceFilter(range); setPage(1) }}
                  className={`block w-full text-left px-2 py-1.5 rounded-[var(--radius)] text-sm transition-colors ${
                    priceFilter === range
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Color</h3>
            <div className="flex flex-wrap gap-2">
              {['bg-foreground', 'bg-background border border-border', 'bg-primary', 'bg-warning/60', 'bg-success/60', 'bg-muted-foreground'].map((cls, i) => (
                <button key={i} className={`w-6 h-6 rounded-full ${cls} hover:ring-2 hover:ring-primary/30 transition-all`} />
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Size</h3>
            <div className="flex flex-wrap gap-1.5">
              {['XS', 'S', 'M', 'L', 'XL'].map((size) => (
                <button key={size} className="px-2.5 py-1 rounded-[var(--radius)] border border-border text-xs text-muted-foreground hover:border-foreground hover:text-foreground transition-colors">
                  {size}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1 p-6">
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-muted-foreground">{filtered.length} products</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {paginated.map((product) => (
              <Link key={product.id} href="/examples/verve/app/product" className="group space-y-3">
                <div className="aspect-[3/4] rounded-[var(--card-radius)] bg-gradient-to-b from-muted/50 to-accent/30 border border-border flex items-center justify-center group-hover:border-primary/30 transition-colors">
                  <div className="text-center text-muted-foreground">
                    <svg className="h-8 w-8 mx-auto mb-1 opacity-25" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
                    </svg>
                    <span className="text-xs">{product.image}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{product.name}</h3>
                  <p className="text-sm font-medium text-foreground">${product.price}</p>
                  <StarRating rating={product.rating} />
                </div>
                <button className="w-full rounded-[var(--button-radius)] border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors">
                  Add to Cart
                </button>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="rounded-[var(--radius)] border border-border px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground disabled:opacity-40 transition-colors"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`w-8 h-8 rounded-[var(--radius)] text-sm font-medium transition-colors ${
                    page === i + 1
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="rounded-[var(--radius)] border border-border px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground disabled:opacity-40 transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
      <ThemeConfigPanel defaultConfig={verveConfig} />
    </div>
  )
}
