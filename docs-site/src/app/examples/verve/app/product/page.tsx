'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ThemeConfigPanel } from '@/components/theme-config-panel'
import { verveConfig } from '../../../theme-configs'

const sizes = ['XS', 'S', 'M', 'L', 'XL']
const colors = [
  { name: 'Sage', class: 'bg-success/40' },
  { name: 'Charcoal', class: 'bg-foreground/70' },
  { name: 'Ivory', class: 'bg-accent' },
]

const reviews = [
  { name: 'Alex M.', rating: 5, date: 'March 2026', text: 'Beautiful quality fabric. Fits true to size and the color is exactly as pictured. Will definitely order more.' },
  { name: 'Jordan K.', rating: 4, date: 'February 2026', text: 'Great dress for everyday wear. Comfortable and versatile. The wrap style is very flattering.' },
  { name: 'Casey P.', rating: 5, date: 'January 2026', text: 'Exceeded expectations. The material feels premium and the stitching is impeccable. Fast shipping too.' },
]

type Tab = 'details' | 'reviews' | 'shipping'

export default function EcommerceProductPage() {
  const [selectedSize, setSelectedSize] = useState('M')
  const [selectedColor, setSelectedColor] = useState('Sage')
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState<Tab>('details')

  return (
    <div className="-mx-8 -mt-12">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-8 py-4 border-b border-border bg-background/80 backdrop-blur-sm">
        <Link href="/examples/verve" className="text-lg font-bold text-foreground tracking-tight">VERVE</Link>
        <div className="flex items-center gap-6">
          <Link href="/examples/verve/app" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Shop</Link>
          <span className="text-sm text-foreground font-medium">Product</span>
          <Link href="/examples/verve/app/cart" className="relative text-muted-foreground hover:text-foreground transition-colors">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
            </svg>
            <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center">3</span>
          </Link>
        </div>
      </nav>

      {/* Breadcrumb */}
      <div className="px-8 py-4 border-b border-border">
        <div className="max-w-5xl mx-auto flex items-center gap-2 text-xs text-muted-foreground">
          <Link href="/examples/verve/app" className="hover:text-foreground transition-colors">Shop</Link>
          <span>/</span>
          <span className="hover:text-foreground cursor-pointer transition-colors">Women</span>
          <span>/</span>
          <span className="text-foreground">Midi Wrap Dress</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-8 py-10">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div className="space-y-3">
            <div className="aspect-square rounded-[var(--card-radius)] bg-gradient-to-b from-muted/50 to-accent/30 border border-border flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <svg className="h-16 w-16 mx-auto mb-2 opacity-25" fill="none" viewBox="0 0 24 24" strokeWidth={0.75} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
                </svg>
                <span className="text-sm">Main Product Image</span>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className={`aspect-square rounded-[var(--radius)] bg-gradient-to-b from-muted/40 to-accent/20 border flex items-center justify-center cursor-pointer hover:border-primary/30 transition-colors ${i === 0 ? 'border-primary' : 'border-border'}`}>
                  <svg className="h-5 w-5 text-muted-foreground opacity-25" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
                  </svg>
                </div>
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-semibold text-foreground" style={{ letterSpacing: 'var(--heading-letter-spacing)' }}>
                Midi Wrap Dress
              </h1>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-xl font-semibold text-foreground">$112</span>
                <div className="flex items-center gap-1.5">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <svg key={i} className={`h-4 w-4 ${i < 4 ? 'text-warning' : 'text-muted'}`} fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">4.8 ({reviews.length} reviews)</span>
                </div>
              </div>
            </div>

            {/* Size */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Size</label>
              <div className="flex gap-2">
                {sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`min-w-[2.5rem] h-10 px-3 rounded-[var(--radius)] border text-sm font-medium transition-colors ${
                      selectedSize === size
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border text-muted-foreground hover:border-foreground hover:text-foreground'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Color */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Color &mdash; {selectedColor}</label>
              <div className="flex gap-2">
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

            {/* Quantity */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Quantity</label>
              <div className="flex items-center gap-0 border border-border rounded-[var(--radius)] w-fit">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="h-10 w-10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
                  </svg>
                </button>
                <span className="h-10 w-12 flex items-center justify-center text-sm font-medium text-foreground border-x border-border">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="h-10 w-10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button className="flex-1 rounded-[var(--button-radius)] bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity">
                Add to Cart
              </button>
              <button className="flex-1 rounded-[var(--button-radius)] border border-foreground bg-background px-6 py-3 text-sm font-medium text-foreground hover:bg-muted transition-colors">
                Buy Now
              </button>
            </div>

            {/* Tabs */}
            <div className="border-t border-border pt-6">
              <div className="flex gap-1 border-b border-border">
                {(['details', 'reviews', 'shipping'] as Tab[]).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2.5 text-sm font-medium capitalize border-b-2 transition-colors ${
                      activeTab === tab
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <div className="py-4">
                {activeTab === 'details' && (
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <p>A flattering midi wrap dress crafted from sustainably sourced viscose fabric. Features a V-neckline, adjustable waist tie, and slightly flared skirt that falls below the knee.</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>100% sustainably sourced viscose</li>
                      <li>Wrap front with interior tie</li>
                      <li>Midi length (approx. 42&quot; from shoulder)</li>
                      <li>Machine washable</li>
                      <li>Model wears size S (height 5&apos;9&quot;)</li>
                    </ul>
                  </div>
                )}
                {activeTab === 'reviews' && (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review.name} className="space-y-2 pb-4 border-b border-border last:border-0">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-foreground">{review.name}</span>
                          <span className="text-xs text-muted-foreground">{review.date}</span>
                        </div>
                        <div className="flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <svg key={i} className={`h-3 w-3 ${i < review.rating ? 'text-warning' : 'text-muted'}`} fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <p className="text-sm text-muted-foreground">{review.text}</p>
                      </div>
                    ))}
                  </div>
                )}
                {activeTab === 'shipping' && (
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <div className="flex items-start gap-3">
                      <svg className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0H6.375m11.25 0h3.375c.621 0 1.125-.504 1.125-1.125v-3.346" />
                      </svg>
                      <div>
                        <p className="font-medium text-foreground">Free Standard Shipping</p>
                        <p>On orders over $75. Delivery in 5-7 business days.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <svg className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
                      </svg>
                      <div>
                        <p className="font-medium text-foreground">Easy Returns</p>
                        <p>30-day return policy. Free returns on all orders.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <ThemeConfigPanel defaultConfig={verveConfig} />
    </div>
  )
}
