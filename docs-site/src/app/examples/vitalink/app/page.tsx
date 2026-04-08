'use client'

import Link from 'next/link'
import { ThemeConfigPanel } from '@/components/theme-config-panel'
import { vitalinkConfig } from '../../theme-configs'

const appointments = [
  { doctor: 'Dr. Emily Carter', specialty: 'General Medicine', date: 'Apr 10, 2026', time: '10:00 AM', type: 'In-person' },
  { doctor: 'Dr. Michael Kim', specialty: 'Cardiology', date: 'Apr 15, 2026', time: '2:30 PM', type: 'Telemedicine' },
  { doctor: 'Dr. Aisha Patel', specialty: 'Dermatology', date: 'Apr 22, 2026', time: '11:00 AM', type: 'In-person' },
]

const labResults = [
  { name: 'Complete Blood Count', date: 'Apr 2, 2026', status: 'Normal', urgent: false },
  { name: 'Lipid Panel', date: 'Mar 28, 2026', status: 'Review needed', urgent: true },
  { name: 'Metabolic Panel', date: 'Mar 28, 2026', status: 'Normal', urgent: false },
]

const themeConfig = `:root {
  --primary: 199 89% 38%;
  --background: 0 0% 99%;
  --card: 0 0% 100%;
  --border: 210 10% 91%;
  --success: 142 71% 35%;
}`

export default function PatientPortal() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/examples/vitalink" className="text-xl font-bold text-primary">VitaLink</Link>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Welcome, Alex</span>
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">AM</div>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-6xl px-6 py-8 space-y-8">
        {/* Welcome Banner */}
        <div className="rounded-[var(--card-radius)] bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-border p-8">
          <h1 className="text-2xl font-bold">Good morning, Alex!</h1>
          <p className="mt-2 text-muted-foreground">You have {appointments.length} upcoming appointments this month.</p>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 sm:grid-cols-4">
          {[
            { label: 'Book Appointment', href: '/examples/vitalink/app/appointments', icon: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" /></svg> },
            { label: 'Message Doctor', href: '/examples/vitalink/app', icon: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" /></svg> },
            { label: 'View Records', href: '/examples/vitalink/app', icon: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" /></svg> },
            { label: 'Prescriptions', href: '/examples/vitalink/app', icon: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 15a9.065 9.065 0 0 0-6.23.693L5 14.5m14.8.8 1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0 1 12 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" /></svg> },
          ].map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className="flex flex-col items-center gap-3 rounded-[var(--card-radius)] border border-border bg-card p-5 text-center transition-all hover:shadow-md hover:border-primary/30"
            >
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                {action.icon}
              </div>
              <span className="text-sm font-medium">{action.label}</span>
            </Link>
          ))}
        </div>

        {/* Upcoming Appointments */}
        <div className="rounded-[var(--card-radius)] border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <h2 className="font-semibold">Upcoming Appointments</h2>
            <Link href="/examples/vitalink/app/appointments" className="text-sm text-primary font-medium hover:underline">
              Book New
            </Link>
          </div>
          <div className="divide-y divide-border">
            {appointments.map((apt, i) => (
              <div key={i} className="flex items-center justify-between px-6 py-4 hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{apt.doctor}</p>
                    <p className="text-xs text-muted-foreground">{apt.specialty}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{apt.date}</p>
                  <p className="text-xs text-muted-foreground">{apt.time} &middot; {apt.type}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Lab Results */}
        <div className="rounded-[var(--card-radius)] border border-border bg-card">
          <div className="border-b border-border px-6 py-4">
            <h2 className="font-semibold">Recent Lab Results</h2>
          </div>
          <div className="divide-y divide-border">
            {labResults.map((lab, i) => (
              <div key={i} className="flex items-center justify-between px-6 py-4 hover:bg-muted/30 transition-colors">
                <div>
                  <p className="text-sm font-medium">{lab.name}</p>
                  <p className="text-xs text-muted-foreground">{lab.date}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                  lab.urgent
                    ? 'bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))]'
                    : 'bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]'
                }`}>
                  {lab.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <ThemeConfigPanel defaultConfig={vitalinkConfig} />
    </div>
  )
}
