'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function HotelBookingPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    requests: '',
    checkin: '2026-04-15',
    checkout: '2026-04-18',
    cardNumber: '',
    expiry: '',
    cvv: '',
  })

  const nights = 3
  const roomPrice = 320
  const tax = Math.round(roomPrice * nights * 0.12)
  const total = roomPrice * nights + tax

  return (
    <div className="-mx-8 -mt-12">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-8 py-4 border-b border-border bg-background/80 backdrop-blur-sm">
        <Link href="/examples/hotel" className="flex items-center gap-2">
          <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3H21m-3.75 3H21" />
          </svg>
          <span className="text-lg font-semibold text-foreground tracking-tight">The Grand Hotel</span>
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/examples/hotel" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Home</Link>
          <Link href="/examples/hotel/app" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Rooms</Link>
          <span className="text-sm text-foreground font-medium">Booking</span>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-8 py-10">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground mb-8" style={{ letterSpacing: 'var(--heading-letter-spacing)' }}>
          Complete Your Reservation
        </h1>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Form */}
          <div className="md:col-span-2 space-y-8">
            {/* Room Summary */}
            <div className="rounded-[var(--card-radius)] border border-border bg-card p-[var(--card-padding)] shadow-[var(--card-shadow)]">
              <h2 className="font-semibold text-foreground mb-4">Selected Room</h2>
              <div className="flex gap-4">
                <div className="w-24 h-20 rounded-[var(--radius)] bg-gradient-to-br from-accent to-muted flex items-center justify-center flex-shrink-0">
                  <svg className="h-6 w-6 text-muted-foreground opacity-50" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-foreground">Ocean View Room</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">Queen Bed &middot; Ocean View &middot; Complimentary Breakfast</p>
                  <p className="text-sm text-primary font-semibold mt-1">${roomPrice}/night</p>
                </div>
              </div>
            </div>

            {/* Guest Details */}
            <div className="rounded-[var(--card-radius)] border border-border bg-card p-[var(--card-padding)] shadow-[var(--card-shadow)] space-y-4">
              <h2 className="font-semibold text-foreground">Guest Details</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Full Name</label>
                  <input
                    type="text"
                    placeholder="John Smith"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-[var(--input-radius)] border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/[var(--placeholder-opacity)] h-[var(--input-height)]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Email</label>
                  <input
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full rounded-[var(--input-radius)] border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/[var(--placeholder-opacity)] h-[var(--input-height)]"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Phone</label>
                <input
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full rounded-[var(--input-radius)] border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/[var(--placeholder-opacity)] h-[var(--input-height)]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Special Requests</label>
                <textarea
                  rows={3}
                  placeholder="Any special requirements or preferences..."
                  value={formData.requests}
                  onChange={(e) => setFormData({ ...formData, requests: e.target.value })}
                  className="w-full rounded-[var(--input-radius)] border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/[var(--placeholder-opacity)] resize-none"
                />
              </div>
            </div>

            {/* Dates */}
            <div className="rounded-[var(--card-radius)] border border-border bg-card p-[var(--card-padding)] shadow-[var(--card-shadow)] space-y-4">
              <h2 className="font-semibold text-foreground">Stay Dates</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Check-in</label>
                  <input
                    type="date"
                    value={formData.checkin}
                    onChange={(e) => setFormData({ ...formData, checkin: e.target.value })}
                    className="w-full rounded-[var(--input-radius)] border border-input bg-background px-3 py-2 text-sm text-foreground h-[var(--input-height)]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Check-out</label>
                  <input
                    type="date"
                    value={formData.checkout}
                    onChange={(e) => setFormData({ ...formData, checkout: e.target.value })}
                    className="w-full rounded-[var(--input-radius)] border border-input bg-background px-3 py-2 text-sm text-foreground h-[var(--input-height)]"
                  />
                </div>
              </div>
            </div>

            {/* Payment */}
            <div className="rounded-[var(--card-radius)] border border-border bg-card p-[var(--card-padding)] shadow-[var(--card-shadow)] space-y-4">
              <h2 className="font-semibold text-foreground">Payment Information</h2>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Card Number</label>
                <input
                  type="text"
                  placeholder="4242 4242 4242 4242"
                  value={formData.cardNumber}
                  onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
                  className="w-full rounded-[var(--input-radius)] border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/[var(--placeholder-opacity)] h-[var(--input-height)]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Expiry</label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    value={formData.expiry}
                    onChange={(e) => setFormData({ ...formData, expiry: e.target.value })}
                    className="w-full rounded-[var(--input-radius)] border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/[var(--placeholder-opacity)] h-[var(--input-height)]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">CVV</label>
                  <input
                    type="text"
                    placeholder="123"
                    value={formData.cvv}
                    onChange={(e) => setFormData({ ...formData, cvv: e.target.value })}
                    className="w-full rounded-[var(--input-radius)] border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/[var(--placeholder-opacity)] h-[var(--input-height)]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Price Summary Sidebar */}
          <div className="md:col-span-1">
            <div className="sticky top-24 rounded-[var(--card-radius)] border border-border bg-card p-[var(--card-padding)] shadow-[var(--card-shadow)] space-y-4">
              <h2 className="font-semibold text-foreground">Price Summary</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Ocean View Room</span>
                  <span>${roomPrice}/night</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>{nights} nights</span>
                  <span>${roomPrice * nights}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Taxes &amp; fees</span>
                  <span>${tax}</span>
                </div>
                <div className="border-t border-border pt-2 flex justify-between font-semibold text-foreground">
                  <span>Total</span>
                  <span>${total}</span>
                </div>
              </div>
              <button className="w-full rounded-[var(--button-radius)] bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity">
                Confirm Booking
              </button>
              <p className="text-xs text-muted-foreground text-center">
                Free cancellation up to 24 hours before check-in
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
