'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ThemeConfigPanel } from '@/components/theme-config-panel'
import { grandviewConfig } from '../../theme-configs'

const allRooms = [
  { id: 1, name: 'Deluxe Suite', price: 450, rating: 4.9, available: true, image: 'Panoramic suite view', amenities: ['King Bed', 'Ocean View', 'Private Balcony', 'Mini Bar', 'Room Service', 'Jacuzzi'], guests: 2 },
  { id: 2, name: 'Ocean View Room', price: 320, rating: 4.7, available: true, image: 'Ocean view room', amenities: ['Queen Bed', 'Ocean View', 'Breakfast', 'Wi-Fi'], guests: 2 },
  { id: 3, name: 'Standard Room', price: 180, rating: 4.5, available: true, image: 'Standard room', amenities: ['Double Bed', 'City View', 'Wi-Fi', 'Coffee Maker'], guests: 2 },
  { id: 4, name: 'Presidential Suite', price: 890, rating: 5.0, available: false, image: 'Presidential suite', amenities: ['King Bed', 'Living Room', 'Kitchen', 'Private Pool', 'Butler Service'], guests: 4 },
  { id: 5, name: 'Family Room', price: 280, rating: 4.6, available: true, image: 'Spacious family room', amenities: ['2 Queen Beds', 'Garden View', 'Kids Play Area', 'Wi-Fi', 'Breakfast'], guests: 4 },
  { id: 6, name: 'Garden Villa', price: 560, rating: 4.8, available: true, image: 'Private garden villa', amenities: ['King Bed', 'Private Garden', 'Outdoor Shower', 'Mini Bar', 'Room Service'], guests: 2 },
  { id: 7, name: 'Penthouse', price: 750, rating: 4.9, available: true, image: 'Rooftop penthouse', amenities: ['King Bed', 'Rooftop Terrace', 'Living Room', 'Mini Bar', 'City View'], guests: 2 },
  { id: 8, name: 'Economy Room', price: 120, rating: 4.3, available: true, image: 'Clean economy room', amenities: ['Single Bed', 'Wi-Fi', 'Coffee Maker'], guests: 1 },
]

type SortKey = 'price-asc' | 'price-desc' | 'rating' | 'availability'

export default function HotelRoomListing() {
  const [sort, setSort] = useState<SortKey>('price-asc')
  const [guestFilter, setGuestFilter] = useState<string>('any')

  const filtered = allRooms
    .filter((r) => guestFilter === 'any' || r.guests >= parseInt(guestFilter))
    .sort((a, b) => {
      switch (sort) {
        case 'price-asc': return a.price - b.price
        case 'price-desc': return b.price - a.price
        case 'rating': return b.rating - a.rating
        case 'availability': return (b.available ? 1 : 0) - (a.available ? 1 : 0)
        default: return 0
      }
    })

  return (
    <div className="">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-8 py-4 border-b border-border bg-background/80 backdrop-blur-sm">
        <Link href="/examples/grandview" className="flex items-center gap-2">
          <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3H21m-3.75 3H21" />
          </svg>
          <span className="text-lg font-semibold text-foreground tracking-tight">The Grandview</span>
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/examples/grandview" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Home</Link>
          <Link href="/examples/grandview/app" className="text-sm text-foreground font-medium">Rooms</Link>
          <Link href="/examples/grandview/app/booking" className="rounded-[var(--button-radius)] bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity">
            Book Now
          </Link>
        </div>
      </nav>

      {/* Filter Bar */}
      <div className="px-8 py-6 border-b border-border bg-muted/20">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Check-in</label>
              <input
                type="date"
                defaultValue="2026-04-15"
                className="block rounded-[var(--input-radius)] border border-input bg-background px-3 py-2 text-sm text-foreground h-[var(--input-height)]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Check-out</label>
              <input
                type="date"
                defaultValue="2026-04-18"
                className="block rounded-[var(--input-radius)] border border-input bg-background px-3 py-2 text-sm text-foreground h-[var(--input-height)]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Guests</label>
              <select
                value={guestFilter}
                onChange={(e) => setGuestFilter(e.target.value)}
                className="block rounded-[var(--input-radius)] border border-input bg-background px-3 py-2 text-sm text-foreground h-[var(--input-height)]"
              >
                <option value="any">Any</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="4">4+</option>
              </select>
            </div>
            <button className="rounded-[var(--button-radius)] bg-primary px-6 py-2 text-sm font-medium text-primary-foreground h-[var(--input-height)] hover:opacity-90 transition-opacity">
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Sort + Results */}
      <div className="max-w-4xl mx-auto px-8 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{filtered.length} rooms found</p>
          <div className="flex items-center gap-2">
            <label className="text-xs text-muted-foreground">Sort by:</label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="rounded-[var(--input-radius)] border border-input bg-background px-3 py-1.5 text-sm text-foreground"
            >
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Rating</option>
              <option value="availability">Availability</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          {filtered.map((room) => (
            <div key={room.id} className="flex gap-5 rounded-[var(--card-radius)] border border-border bg-card p-4 shadow-[var(--card-shadow)]">
              <div className="w-48 h-32 flex-shrink-0 rounded-[var(--radius)] bg-gradient-to-br from-accent to-muted flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <svg className="h-8 w-8 mx-auto mb-1 opacity-50" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
                  </svg>
                  <span className="text-xs">{room.image}</span>
                </div>
              </div>
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground">{room.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-warning font-medium">{room.rating}</span>
                        <div className="flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <svg key={i} className={`h-3 w-3 ${i < Math.floor(room.rating) ? 'text-warning' : 'text-muted'}`} fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-bold text-primary">${room.price}</span>
                      <span className="text-xs text-muted-foreground">/night</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {room.amenities.slice(0, 4).map((a) => (
                      <span key={a} className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{a}</span>
                    ))}
                    {room.amenities.length > 4 && (
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">+{room.amenities.length - 4} more</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <span className={`text-xs font-medium ${room.available ? 'text-success' : 'text-destructive'}`}>
                    {room.available ? 'Available' : 'Sold Out'}
                  </span>
                  <Link
                    href="/examples/grandview/app/booking"
                    className={`rounded-[var(--button-radius)] px-4 py-1.5 text-sm font-medium transition-opacity ${
                      room.available
                        ? 'bg-primary text-primary-foreground hover:opacity-90'
                        : 'bg-muted text-muted-foreground cursor-not-allowed'
                    }`}
                  >
                    {room.available ? 'Book' : 'Unavailable'}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <ThemeConfigPanel defaultConfig={grandviewConfig} />
    </div>
  )
}
