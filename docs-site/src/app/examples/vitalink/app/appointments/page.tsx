'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ThemeConfigPanel } from '@/components/theme-config-panel'
import { vitalinkConfig } from '../../../theme-configs'
import { specialties, doctorsBySpecialty, timeSlots } from '../../config'

const themeConfig = `:root {
  --primary: 199 89% 38%;
  --background: 0 0% 99%;
  --card: 0 0% 100%;
  --border: 210 10% 91%;
}`

export default function BookAppointment() {
  const [specialty, setSpecialty] = useState('')
  const [selectedDoctor, setSelectedDoctor] = useState('')
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')

  const doctors = specialty ? doctorsBySpecialty[specialty] || [] : []

  // Generate next 14 days
  const dates = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(2026, 3, 7 + i)
    return {
      full: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      day: d.toLocaleDateString('en-US', { weekday: 'short' }),
      key: d.toISOString().split('T')[0],
      weekend: d.getDay() === 0 || d.getDay() === 6,
    }
  })

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <Link href="/examples/vitalink" className="text-xl font-bold text-primary">VitaLink</Link>
          <Link href="/examples/vitalink/app" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Back to Portal
          </Link>
        </div>
      </nav>

      <div className="mx-auto max-w-4xl px-6 py-8 space-y-8">
        <div>
          <h1 className="text-2xl font-bold">Book an Appointment</h1>
          <p className="mt-1 text-muted-foreground">Select a specialty, doctor, and preferred time.</p>
        </div>

        {/* Step 1: Specialty */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">1. Choose a Specialty</h2>
          <div className="flex flex-wrap gap-2">
            {specialties.map((s) => (
              <button
                key={s}
                onClick={() => { setSpecialty(s); setSelectedDoctor(''); }}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  specialty === s ? 'bg-primary text-primary-foreground' : 'border border-border hover:bg-muted'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Doctor */}
        {specialty && (
          <div className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">2. Select a Doctor</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {doctors.map((doc) => (
                <button
                  key={doc.name}
                  onClick={() => doc.available && setSelectedDoctor(doc.name)}
                  disabled={!doc.available}
                  className={`flex items-center gap-4 rounded-[var(--card-radius)] border p-4 text-left transition-all ${
                    selectedDoctor === doc.name
                      ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                      : doc.available
                        ? 'border-border bg-card hover:border-primary/30 hover:shadow-sm'
                        : 'border-border bg-muted/30 opacity-60 cursor-not-allowed'
                  }`}
                >
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-primary">{doc.initials}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{doc.name}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <svg className="h-3.5 w-3.5 text-[hsl(var(--warning))]" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                      <span className="text-xs text-muted-foreground">{doc.rating}</span>
                      {!doc.available && <span className="ml-2 text-xs text-[hsl(var(--destructive))]">Unavailable</span>}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Date */}
        {selectedDoctor && (
          <div className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">3. Pick a Date</h2>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {dates.filter(d => !d.weekend).map((d) => (
                <button
                  key={d.key}
                  onClick={() => setSelectedDate(d.key)}
                  className={`flex flex-col items-center rounded-[var(--radius)] border px-4 py-3 text-sm transition-colors flex-shrink-0 ${
                    selectedDate === d.key ? 'border-primary bg-primary text-primary-foreground' : 'border-border hover:bg-muted'
                  }`}
                >
                  <span className="text-xs font-medium opacity-70">{d.day}</span>
                  <span className="font-semibold">{d.full}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Time */}
        {selectedDate && (
          <div className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">4. Select a Time</h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {timeSlots.map((t) => (
                <button
                  key={t}
                  onClick={() => setSelectedTime(t)}
                  className={`rounded-[var(--radius)] border px-3 py-2 text-sm font-medium transition-colors ${
                    selectedTime === t ? 'border-primary bg-primary text-primary-foreground' : 'border-border hover:bg-muted'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 5: Reason + Confirm */}
        {selectedTime && (
          <div className="space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">5. Reason for Visit</h2>
            <textarea
              rows={4}
              placeholder="Briefly describe your symptoms or reason for the visit..."
              className="w-full rounded-[var(--input-radius)] border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />

            {/* Summary */}
            <div className="rounded-[var(--card-radius)] border border-border bg-muted/30 p-6 space-y-2">
              <h3 className="text-sm font-semibold">Appointment Summary</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-muted-foreground">Specialty:</span>
                <span className="font-medium">{specialty}</span>
                <span className="text-muted-foreground">Doctor:</span>
                <span className="font-medium">{selectedDoctor}</span>
                <span className="text-muted-foreground">Date:</span>
                <span className="font-medium">{dates.find(d => d.key === selectedDate)?.full}</span>
                <span className="text-muted-foreground">Time:</span>
                <span className="font-medium">{selectedTime}</span>
              </div>
            </div>

            <button className="w-full rounded-[var(--button-radius)] bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-lg hover:opacity-90 transition-opacity">
              Confirm Appointment
            </button>
          </div>
        )}
      </div>

      <ThemeConfigPanel defaultConfig={vitalinkConfig} />
    </div>
  )
}
