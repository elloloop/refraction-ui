'use client'

import { useState } from 'react'
import Link from 'next/link'
import { PageShell } from '@refraction-ui/react-app-shell'
import { ThemeConfigPanel } from '@/components/theme-config-panel'
import { emberConfig } from '../../../theme-configs'
import { timeSlots } from '../../config'

export default function RestaurantReservationPage() {
  const [formData, setFormData] = useState({
    date: '2026-04-15',
    time: '7:30 PM',
    partySize: '2',
    name: '',
    phone: '',
    email: '',
    specialOccasion: false,
    requests: '',
  })

  return (
    <PageShell config={{ navSticky: true }}>
      {/* Navigation */}
      <PageShell.Nav className="justify-between bg-background/80 backdrop-blur-sm">
        <Link href="/examples/ember" className="text-lg font-semibold text-foreground tracking-tight">
          Ember &amp; Oak
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/examples/ember" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Home</Link>
          <Link href="/examples/ember/app" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Menu</Link>
          <span className="text-sm text-foreground font-medium">Reservation</span>
        </div>
      </PageShell.Nav>

      <PageShell.Section maxWidth="xl" className="py-10">
        <div className="space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground" style={{ letterSpacing: 'var(--heading-letter-spacing)' }}>
              Reserve a Table
            </h1>
            <p className="text-muted-foreground">Join us for an unforgettable dining experience.</p>
          </div>

          <div className="rounded-[var(--card-radius)] border border-border bg-card p-[var(--card-padding)] shadow-[var(--card-shadow)] space-y-6">
            {/* Date & Time */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full rounded-[var(--input-radius)] border border-input bg-background px-3 py-2 text-sm text-foreground h-[var(--input-height)]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Time</label>
                <select
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="w-full rounded-[var(--input-radius)] border border-input bg-background px-3 py-2 text-sm text-foreground h-[var(--input-height)]"
                >
                  {timeSlots.map((time) => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Party Size */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Party Size</label>
              <select
                value={formData.partySize}
                onChange={(e) => setFormData({ ...formData, partySize: e.target.value })}
                className="w-full rounded-[var(--input-radius)] border border-input bg-background px-3 py-2 text-sm text-foreground h-[var(--input-height)]"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                  <option key={n} value={String(n)}>{n} {n === 1 ? 'Guest' : 'Guests'}</option>
                ))}
                <option value="9+">9+ (Large Party)</option>
              </select>
            </div>

            {/* Divider */}
            <div className="border-t border-border" />

            {/* Guest Info */}
            <div className="space-y-4">
              <h2 className="font-medium text-foreground">Guest Information</h2>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Name</label>
                <input
                  type="text"
                  placeholder="Full name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-[var(--input-radius)] border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/[var(--placeholder-opacity)] h-[var(--input-height)]"
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
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
                  <label className="text-sm font-medium text-foreground">Email</label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full rounded-[var(--input-radius)] border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/[var(--placeholder-opacity)] h-[var(--input-height)]"
                  />
                </div>
              </div>
            </div>

            {/* Special Occasion */}
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.specialOccasion}
                onChange={(e) => setFormData({ ...formData, specialOccasion: e.target.checked })}
                className="h-4 w-4 rounded-[var(--radius-sm)] border border-input text-primary accent-primary"
              />
              <span className="text-sm text-foreground">This is a special occasion</span>
            </label>

            {/* Special Requests */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Special Requests</label>
              <textarea
                rows={3}
                placeholder="Dietary restrictions, seating preferences, celebrations..."
                value={formData.requests}
                onChange={(e) => setFormData({ ...formData, requests: e.target.value })}
                className="w-full rounded-[var(--input-radius)] border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/[var(--placeholder-opacity)] resize-none"
              />
            </div>

            {/* Submit */}
            <button className="w-full rounded-[var(--button-radius)] bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity">
              Reserve
            </button>

            <p className="text-xs text-muted-foreground text-center">
              You will receive a confirmation email within a few minutes. For parties of 9 or more, please call us directly.
            </p>
          </div>
        </div>
      </PageShell.Section>

      {/* Footer */}
      <PageShell.Footer columns={2} className="mt-8">
        <span className="text-sm text-muted-foreground">&copy; 2026 Ember &amp; Oak</span>
        <div className="flex justify-end">
          <span className="text-sm text-muted-foreground">+1 (415) 555-0182</span>
        </div>
      </PageShell.Footer>

      <ThemeConfigPanel defaultConfig={emberConfig} />
    </PageShell>
  )
}
