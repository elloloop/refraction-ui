'use client'

import Link from 'next/link'
import { ThemeConfigPanel } from '@/components/theme-config-panel'
import { maisonConfig } from '../../theme-configs'
import { products } from '../config'

export default function LuxuryCollectionPage() {
  return (
    <div className="">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-8 py-6 border-b border-border/30">
        <Link href="/examples/maison" className="text-sm tracking-[0.2em] uppercase text-muted-foreground hover:text-foreground transition-colors">
          Maison Eclat
        </Link>
        <div className="flex items-center gap-8">
          <span className="text-xs tracking-[0.15em] uppercase text-foreground font-medium">Collection</span>
          <Link href="/examples/maison/app/product" className="text-xs tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground transition-colors">Atelier</Link>
        </div>
      </nav>

      {/* Collection Header */}
      <div className="px-8 py-16 text-center">
        <h1 className="text-3xl font-light text-foreground mb-3" style={{ letterSpacing: 'var(--letter-spacing-tight)' }}>
          The Collection
        </h1>
        <p className="text-sm text-muted-foreground">Spring / Summer 2026</p>
      </div>

      {/* Product Grid */}
      <div className="px-8 pb-24">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-x-8 gap-y-16">
          {products.map((product) => (
            <Link key={product.id} href="/examples/maison/app/product" className="group space-y-5">
              <div className="aspect-[3/4] rounded-[var(--card-radius)] bg-gradient-to-b from-muted/30 to-accent/20 border border-border/20 flex items-center justify-center group-hover:border-border/50 transition-all">
                <div className="text-center text-muted-foreground">
                  <svg className="h-10 w-10 mx-auto mb-2 opacity-15" fill="none" viewBox="0 0 24 24" strokeWidth={0.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
                  </svg>
                  <span className="text-xs tracking-wider">{product.category}</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs tracking-[0.1em] uppercase text-muted-foreground">{product.category}</p>
                <h3 className="text-foreground font-light group-hover:text-primary transition-colors">{product.name}</h3>
                <p className="text-sm text-muted-foreground">{product.price}</p>
              </div>
              <span className="inline-block text-xs tracking-[0.1em] uppercase text-muted-foreground border-b border-transparent group-hover:border-muted-foreground transition-colors">
                View
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border/30 px-8 py-8">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <span className="text-xs tracking-[0.15em] uppercase text-muted-foreground">&copy; 2026 Maison Eclat</span>
          <div className="flex gap-6">
            <span className="text-xs text-muted-foreground">Privacy</span>
            <span className="text-xs text-muted-foreground">Terms</span>
          </div>
        </div>
      </footer>
      <ThemeConfigPanel defaultConfig={maisonConfig} />
    </div>
  )
}
