'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ThemeConfigPanel } from '@/components/theme-config-panel'
import { verveConfig } from '../../../theme-configs'
import { initialItems } from '../../config'
import { VerveLogo } from '@/components/logos';


interface CartItem {
  id: number
  name: string
  size: string
  color: string
  price: number
  quantity: number
  image: string
}

export default function EcommerceCartPage() {
  const [items, setItems] = useState<CartItem[]>(initialItems)

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity < 1) return
    setItems(items.map((item) => item.id === id ? { ...item, quantity } : item))
  }

  const removeItem = (id: number) => {
    setItems(items.filter((item) => item.id !== id))
  }

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = subtotal > 75 ? 0 : 8
  const tax = Math.round(subtotal * 0.08)
  const total = subtotal + shipping + tax

  return (
    <div className="">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-8 py-4 border-b border-border bg-background/80 backdrop-blur-sm">
        <Link href="/examples/verve" className="text-lg font-bold text-foreground tracking-tight"><VerveLogo className="h-6 w-auto" /></Link>
        <div className="flex items-center gap-6">
          <Link href="/examples/verve/app" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Shop</Link>
          <span className="text-sm text-foreground font-medium">Cart ({items.reduce((s, i) => s + i.quantity, 0)})</span>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-8 py-10">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground mb-8" style={{ letterSpacing: 'var(--heading-letter-spacing)' }}>
          Shopping Cart
        </h1>

        {items.length === 0 ? (
          <div className="text-center py-16 space-y-4">
            <svg className="h-12 w-12 mx-auto text-muted-foreground opacity-40" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
            </svg>
            <p className="text-muted-foreground">Your cart is empty.</p>
            <Link href="/examples/verve/app" className="inline-block text-sm text-primary hover:underline">
              Continue Shopping &rarr;
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="md:col-span-2 space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 rounded-[var(--card-radius)] border border-border bg-card p-4 shadow-[var(--card-shadow)]">
                  <div className="w-24 h-24 flex-shrink-0 rounded-[var(--radius)] bg-gradient-to-b from-muted/50 to-accent/30 flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <svg className="h-6 w-6 mx-auto opacity-30" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
                      </svg>
                      <span className="text-[10px]">{item.image}</span>
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-foreground">{item.name}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">Size: {item.size} &middot; Color: {item.color}</p>
                      </div>
                      <span className="text-sm font-medium text-foreground">${item.price * item.quantity}</span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-0 border border-border rounded-[var(--radius)]">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="h-8 w-8 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
                          </svg>
                        </button>
                        <span className="h-8 w-8 flex items-center justify-center text-xs font-medium text-foreground border-x border-border">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="h-8 w-8 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                          </svg>
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-xs text-destructive hover:underline transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              <Link href="/examples/verve/app" className="inline-block text-sm text-primary hover:underline mt-2">
                &larr; Continue Shopping
              </Link>
            </div>

            {/* Cart Summary */}
            <div className="md:col-span-1">
              <div className="sticky top-24 rounded-[var(--card-radius)] border border-border bg-card p-[var(--card-padding)] shadow-[var(--card-shadow)] space-y-4">
                <h2 className="font-semibold text-foreground">Order Summary</h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>${subtotal}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? 'Free' : `$${shipping}`}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Tax</span>
                    <span>${tax}</span>
                  </div>
                  <div className="border-t border-border pt-2 flex justify-between font-semibold text-foreground">
                    <span>Total</span>
                    <span>${total}</span>
                  </div>
                </div>
                {shipping === 0 && (
                  <p className="text-xs text-success flex items-center gap-1">
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                    Free shipping applied
                  </p>
                )}
                <button className="w-full rounded-[var(--button-radius)] bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity">
                  Checkout
                </button>
                <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground pt-2">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                  </svg>
                  Secure SSL Checkout
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <ThemeConfigPanel defaultConfig={verveConfig} />
    </div>
  )
}
