'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ThemeConfigPanel } from '@/components/theme-config-panel'
import { insightiqConfig } from '../../theme-configs'

const activities = [
  { date: 'Apr 5, 2026', user: 'Sarah Chen', action: 'Upgraded to Pro plan', status: 'completed' },
  { date: 'Apr 5, 2026', user: 'Marcus Johnson', action: 'Created new dashboard', status: 'completed' },
  { date: 'Apr 4, 2026', user: 'Elena Rodriguez', action: 'Exported monthly report', status: 'completed' },
  { date: 'Apr 4, 2026', user: 'James Wilson', action: 'Invited 3 team members', status: 'pending' },
  { date: 'Apr 3, 2026', user: 'Priya Patel', action: 'Set up messaging integration', status: 'completed' },
  { date: 'Apr 3, 2026', user: 'Tom Baker', action: 'Cancelled subscription', status: 'failed' },
]

const themeConfig = `:root {
  --primary: 250 50% 50%;
  --background: 0 0% 99%;
  --card: 0 0% 99%;
  --border: 240 6% 92%;
}`

export default function SaasDashboard() {
  const [dateRange, setDateRange] = useState('last-30')

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 w-60 border-r border-border bg-card">
        <div className="flex h-14 items-center gap-2 border-b border-border px-5">
          <span className="text-lg font-bold text-primary">InsightIQ</span>
        </div>
        <nav className="mt-4 space-y-1 px-3">
          {[
            { label: 'Dashboard', href: '/examples/insightiq/app', active: true, icon: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg> },
            { label: 'Analytics', href: '/examples/insightiq/app', icon: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" /></svg> },
            { label: 'Customers', href: '/examples/insightiq/app', icon: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" /></svg> },
            { label: 'Settings', href: '/examples/insightiq/app/settings', icon: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg> },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 rounded-[var(--radius)] px-3 py-2 text-sm font-medium transition-colors ${item.active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <main className="ml-60 flex-1">
        {/* Top bar */}
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-background/80 backdrop-blur-sm px-8 py-4">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold">Dashboard</h1>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="rounded-[var(--input-radius)] border border-border bg-background px-3 py-1.5 text-sm text-foreground"
            >
              <option value="last-7">Last 7 days</option>
              <option value="last-30">Last 30 days</option>
              <option value="last-90">Last 90 days</option>
              <option value="ytd">Year to date</option>
            </select>
          </div>
          <button className="rounded-[var(--button-radius)] border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors">
            Export
          </button>
        </header>

        <div className="p-8 space-y-8">
          {/* Stats */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: 'Revenue', value: '$48,250', change: '+12.5%', up: true },
              { label: 'Users', value: '2,340', change: '+8.1%', up: true },
              { label: 'Conversion', value: '3.2%', change: '+0.4%', up: true },
              { label: 'Churn', value: '1.4%', change: '-0.2%', up: false },
            ].map((stat) => (
              <div key={stat.label} className="rounded-[var(--card-radius)] border border-border bg-card p-6">
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="mt-2 text-3xl font-bold">{stat.value}</p>
                <span className={`mt-1 inline-flex items-center gap-1 text-sm font-medium ${stat.up ? 'text-[hsl(var(--success))]' : 'text-[hsl(var(--destructive))]'}`}>
                  {stat.up ? (
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" /></svg>
                  ) : (
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 4.5l15 15m0 0V8.25m0 11.25H8.25" /></svg>
                  )}
                  {stat.change}
                </span>
              </div>
            ))}
          </div>

          {/* Chart placeholder */}
          <div className="rounded-[var(--card-radius)] border border-border bg-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-semibold">Revenue Overview</h2>
              <div className="flex gap-2">
                {['Week', 'Month', 'Year'].map((t) => (
                  <button key={t} className={`rounded-[var(--radius)] px-3 py-1 text-xs font-medium ${t === 'Month' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}>{t}</button>
                ))}
              </div>
            </div>
            <div className="relative h-64">
              {/* Y axis */}
              <div className="absolute inset-y-0 left-0 flex flex-col justify-between text-xs text-muted-foreground pr-3">
                <span>$60k</span><span>$45k</span><span>$30k</span><span>$15k</span><span>$0</span>
              </div>
              {/* Grid */}
              <div className="ml-10 h-full border-l border-b border-border relative">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="absolute left-0 right-0 border-t border-border/50" style={{ top: `${i * 25}%` }} />
                ))}
                {/* Bars */}
                <div className="absolute inset-0 flex items-end justify-around px-4 pb-0">
                  {[65, 45, 72, 58, 80, 68, 90, 55, 75, 62, 85, 78].map((h, i) => (
                    <div key={i} className="w-[6%] rounded-t-sm bg-primary/80 hover:bg-primary transition-colors" style={{ height: `${h}%` }} />
                  ))}
                </div>
              </div>
              {/* X axis */}
              <div className="ml-10 flex justify-around text-xs text-muted-foreground mt-2">
                {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m) => (
                  <span key={m}>{m}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="rounded-[var(--card-radius)] border border-border bg-card">
            <div className="border-b border-border px-6 py-4">
              <h2 className="text-sm font-semibold">Recent Activity</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Date</th>
                    <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">User</th>
                    <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Action</th>
                    <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {activities.map((a, i) => (
                    <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 text-sm text-muted-foreground">{a.date}</td>
                      <td className="px-6 py-4 text-sm font-medium">{a.user}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{a.action}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          a.status === 'completed' ? 'bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]' :
                          a.status === 'pending' ? 'bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))]' :
                          'bg-[hsl(var(--destructive))]/10 text-[hsl(var(--destructive))]'
                        }`}>
                          {a.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      <ThemeConfigPanel defaultConfig={insightiqConfig} />
    </div>
  )
}
