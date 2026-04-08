'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ThemeConfigPanel } from '@/components/theme-config-panel'
import { luxuryConfig } from '../../../theme-configs'

const sizes = ['S', 'M', 'L']
const colors = [
  { name: 'Noir', class: 'bg-foreground' },
  { name: 'Ivory', class: 'bg-accent' },
  { name: 'Cognac', class: 'bg-warning/60' },
]

export default function LuxuryProductPage() {
  const [selectedSize, setSelectedSize] = useState('M')
  const [selectedColor, setSelectedColor] = useState('Noir')

  return (
    <div className="-mx-8 -mt-12">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-8 py-6 border-b border-border/30">
        <Link href="/examples/luxury" className="text-sm tracking-[0.2em] uppercase text-muted-foreground hover:text-foreground transition-colors">
          Maison Lumiere
        </Link>
        <div className="flex items-center gap-8">
          <Link href="/examples/luxury/app" className="text-xs tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground transition-colors">Collection</Link>
          <span className="text-xs tracking-[0.15em] uppercase text-foreground font-medium">Product</span>
        </div>
      </nav>

      {/* Breadcrumb */}
      <div className="px-8 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-2 text-xs text-muted-foreground">
          <Link href="/examples/luxury/app" className="hover:text-foreground transition-colors">Collection</Link>
          <span>/</span>
          <span className="text-foreground">Onyx Clutch</span>
        </div>
      </div>

      {/* Product */}
      <div className="max-w-4xl mx-auto px-8 py-8">
        <div className="grid md:grid-cols-2 gap-16">
          {/* Image */}
          <div className="space-y-4">
            <div className="aspect-square rounded-[var(--card-radius)] bg-gradient-to-b from-muted/30 to-accent/20 border border-border/20 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <svg className="h-20 w-20 mx-auto mb-3 opacity-15" fill="none" viewBox="0 0 24 24" strokeWidth={0.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
                </svg>
                <span className="text-sm tracking-wider">Product Image</span>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-8 py-4">
            <div className="space-y-3">
              <p className="text-xs tracking-[0.15em] uppercase text-muted-foreground">Leather Goods</p>
              <h1 className="text-2xl font-light text-foreground" style={{ letterSpacing: 'var(--letter-spacing-tight)' }}>
                Onyx Clutch
              </h1>
              <p className="text-lg text-muted-foreground">$2,400</p>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed">
              Crafted from the finest full-grain calfskin leather, the Onyx Clutch embodies understated sophistication. Hand-stitched by our master artisans in our Paris atelier, each piece features our signature invisible closure and hand-painted edges. The interior is lined in supple lambskin with a single compartment and card slot.
            </p>

            {/* Size */}
            <div className="space-y-3">
              <label className="text-xs tracking-[0.1em] uppercase text-muted-foreground">Size</label>
              <div className="flex gap-3">
                {sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-12 h-12 rounded-[var(--radius)] border text-sm transition-colors ${
                      selectedSize === size
                        ? 'border-foreground text-foreground'
                        : 'border-border text-muted-foreground hover:border-foreground/50'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Color */}
            <div className="space-y-3">
              <label className="text-xs tracking-[0.1em] uppercase text-muted-foreground">
                Color &mdash; {selectedColor}
              </label>
              <div className="flex gap-3">
                {colors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color.name)}
                    className={`w-8 h-8 rounded-full ${color.class} border-2 transition-all ${
                      selectedColor === color.name
                        ? 'border-primary ring-2 ring-primary/20'
                        : 'border-border hover:border-muted-foreground'
                    }`}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            {/* Add to Bag */}
            <button className="w-full rounded-[var(--button-radius)] bg-foreground px-6 py-3.5 text-sm tracking-[0.1em] uppercase font-light text-background hover:opacity-90 transition-opacity">
              Add to Bag
            </button>

            {/* Shipping note */}
            <p className="text-xs text-muted-foreground text-center tracking-wider">
              Complimentary shipping worldwide
            </p>

            {/* Details */}
            <div className="border-t border-border/30 pt-6 space-y-3">
              <p className="text-xs tracking-[0.1em] uppercase text-muted-foreground">Details</p>
              <ul className="space-y-1.5 text-sm text-muted-foreground">
                <li>Full-grain calfskin leather</li>
                <li>Hand-stitched in Paris</li>
                <li>Hand-painted edges</li>
                <li>Lambskin interior lining</li>
                <li>Dimensions: 28cm x 16cm x 4cm</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border/30 px-8 py-8 mt-16">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <span className="text-xs tracking-[0.15em] uppercase text-muted-foreground">&copy; 2026 Maison Lumiere</span>
          <div className="flex gap-6">
            <span className="text-xs text-muted-foreground">Privacy</span>
            <span className="text-xs text-muted-foreground">Terms</span>
          </div>
        </div>
      </footer>
      <ThemeConfigPanel defaultConfig={luxuryConfig} />
    </div>
  )
}
