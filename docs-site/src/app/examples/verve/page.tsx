'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ThemeConfigPanel } from '@/components/theme-config-panel'
import { verveConfig } from '../theme-configs'

const featuredProducts = [
  { id: 1, name: 'Linen Blend Shirt', price: '$68', image: 'Relaxed linen shirt' },
  { id: 2, name: 'Wide Leg Trousers', price: '$89', image: 'Flowing wide leg trousers' },
  { id: 3, name: 'Canvas Tote Bag', price: '$42', image: 'Everyday canvas tote' },
  { id: 4, name: 'Leather Sandals', price: '$95', image: 'Handcrafted leather sandals' },
]

const categoryCards = [
  { name: 'Women', count: '240+ items' },
  { name: 'Men', count: '180+ items' },
  { name: 'Accessories', count: '120+ items' },
  { name: 'Sale', count: 'Up to 50% off' },
]

export default function VerveLandingPage() {
  const [email, setEmail] = useState('')

  return (
    <div className="-mx-8 -mt-12">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-8 py-4 border-b border-border bg-background/80 backdrop-blur-sm">
        <Link href="/examples/verve" className="text-lg font-bold text-foreground tracking-tight">VERVE</Link>
        <div className="flex items-center gap-6">
          <Link href="/examples/verve/app" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Shop</Link>
          <Link href="/examples/verve/app/product" className="text-sm text-muted-foreground hover:text-foreground transition-colors">New In</Link>
          <Link href="/examples/verve/app/cart" className="relative text-muted-foreground hover:text-foreground transition-colors">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
            </svg>
            <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center">3</span>
          </Link>
        </div>
      </nav>

      {/* Hero Banner */}
      <section className="relative">
        <div className="h-[420px] bg-gradient-to-r from-primary/15 via-accent to-primary/10 flex items-center justify-center">
          <div className="text-center space-y-6 px-8">
            <p className="text-sm tracking-[0.15em] uppercase text-muted-foreground">New Season</p>
            <h1 className="text-5xl font-bold tracking-tight text-foreground" style={{ letterSpacing: 'var(--heading-letter-spacing)' }}>
              Summer Collection
            </h1>
            <p className="text-lg text-muted-foreground max-w-md mx-auto">
              Effortless style for warmer days. Lightweight fabrics, natural tones, timeless silhouettes.
            </p>
            <Link
              href="/examples/verve/app"
              className="inline-flex items-center gap-2 rounded-[var(--button-radius)] bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
            >
              Shop Now
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="px-8 py-[var(--section-gap)]">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground" style={{ letterSpacing: 'var(--heading-letter-spacing)' }}>
              Featured
            </h2>
            <Link href="/examples/verve/app" className="text-sm text-primary hover:underline">View all &rarr;</Link>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <Link key={product.id} href="/examples/verve/app/product" className="group space-y-3">
                <div className="aspect-[3/4] rounded-[var(--card-radius)] bg-gradient-to-b from-muted/50 to-accent/30 border border-border flex items-center justify-center group-hover:border-primary/30 transition-colors">
                  <div className="text-center text-muted-foreground">
                    <svg className="h-8 w-8 mx-auto mb-1 opacity-30" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
                    </svg>
                    <span className="text-xs">{product.image}</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{product.name}</h3>
                  <p className="text-sm text-muted-foreground">{product.price}</p>
                </div>
                <button className="w-full rounded-[var(--button-radius)] border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors">
                  Add to Cart
                </button>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Category Cards */}
      <section className="px-8 py-[var(--section-gap)] bg-muted/20">
        <div className="max-w-4xl mx-auto space-y-8">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground text-center" style={{ letterSpacing: 'var(--heading-letter-spacing)' }}>
            Shop by Category
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
            {categoryCards.map((cat) => (
              <Link
                key={cat.name}
                href="/examples/verve/app"
                className="group rounded-[var(--card-radius)] border border-border bg-card p-6 text-center hover:border-primary/30 hover:shadow-[var(--shadow-md)] transition-all"
              >
                <div className="h-20 flex items-center justify-center mb-3">
                  <svg className="h-10 w-10 text-muted-foreground opacity-40 group-hover:opacity-60 transition-opacity" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                  </svg>
                </div>
                <h3 className="font-medium text-foreground">{cat.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">{cat.count}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="px-8 py-[var(--section-gap)]">
        <div className="max-w-xl mx-auto text-center space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground" style={{ letterSpacing: 'var(--heading-letter-spacing)' }}>
            Stay in the Loop
          </h2>
          <p className="text-sm text-muted-foreground">
            Subscribe for exclusive offers, new arrivals, and 10% off your first order.
          </p>
          <div className="flex gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 rounded-[var(--input-radius)] border border-input bg-background px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground/[var(--placeholder-opacity)] h-[var(--input-height)]"
            />
            <button className="rounded-[var(--button-radius)] bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity h-[var(--input-height)]">
              Subscribe
            </button>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="px-8 py-8 border-t border-border">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-6">
          <div className="text-center space-y-2">
            <svg className="h-6 w-6 mx-auto text-muted-foreground" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0H6.375m11.25 0h3.375c.621 0 1.125-.504 1.125-1.125v-3.346M3.375 14.25v-3.346m0 0a1.152 1.152 0 0 1 .137-.576l2.445-3.667A1.125 1.125 0 0 1 6.895 6h3.21m-6.73 4.904h16.5a1.125 1.125 0 0 0 1.125-1.125V6.375A1.125 1.125 0 0 0 19.875 5.25H10.104" />
            </svg>
            <p className="text-sm font-medium text-foreground">Free Shipping</p>
            <p className="text-xs text-muted-foreground">On orders over $75</p>
          </div>
          <div className="text-center space-y-2">
            <svg className="h-6 w-6 mx-auto text-muted-foreground" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
            </svg>
            <p className="text-sm font-medium text-foreground">Easy Returns</p>
            <p className="text-xs text-muted-foreground">30-day return policy</p>
          </div>
          <div className="text-center space-y-2">
            <svg className="h-6 w-6 mx-auto text-muted-foreground" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
            </svg>
            <p className="text-sm font-medium text-foreground">Secure Payment</p>
            <p className="text-xs text-muted-foreground">SSL encrypted checkout</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/20 px-8 py-10">
        <div className="max-w-4xl mx-auto grid md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <h3 className="font-bold text-foreground">VERVE</h3>
            <p className="text-xs text-muted-foreground">Style redefined for modern living.</p>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-foreground">Shop</h4>
            <div className="space-y-1 text-xs text-muted-foreground">
              <p className="hover:text-foreground cursor-pointer transition-colors">New Arrivals</p>
              <p className="hover:text-foreground cursor-pointer transition-colors">Women</p>
              <p className="hover:text-foreground cursor-pointer transition-colors">Men</p>
              <p className="hover:text-foreground cursor-pointer transition-colors">Accessories</p>
            </div>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-foreground">Help</h4>
            <div className="space-y-1 text-xs text-muted-foreground">
              <p className="hover:text-foreground cursor-pointer transition-colors">Shipping</p>
              <p className="hover:text-foreground cursor-pointer transition-colors">Returns</p>
              <p className="hover:text-foreground cursor-pointer transition-colors">Size Guide</p>
              <p className="hover:text-foreground cursor-pointer transition-colors">Contact</p>
            </div>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-foreground">Follow</h4>
            <div className="space-y-1 text-xs text-muted-foreground">
              <p className="hover:text-foreground cursor-pointer transition-colors">Instagram</p>
              <p className="hover:text-foreground cursor-pointer transition-colors">Pinterest</p>
              <p className="hover:text-foreground cursor-pointer transition-colors">TikTok</p>
            </div>
          </div>
        </div>
        <div className="max-w-4xl mx-auto mt-8 pt-6 border-t border-border text-xs text-muted-foreground text-center">
          &copy; 2026 VERVE. All rights reserved.
        </div>
      </footer>

      <ThemeConfigPanel defaultConfig={verveConfig} />
    </div>
  )
}
