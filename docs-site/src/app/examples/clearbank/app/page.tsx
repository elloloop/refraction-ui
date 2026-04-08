'use client'

import Link from 'next/link'
import { AppShell } from '@refraction-ui/react-app-shell'
import { ThemeConfigPanel } from '@/components/theme-config-panel'
import { clearbankConfig } from '../../theme-configs'
import { transactions, spending } from '../config'

const themeConfig = `:root {
  --primary: 220 70% 45%;
  --background: 0 0% 99%;
  --card: 0 0% 100%;
  --border: 220 10% 91%;
}`

const sidebarNavItems = [
  { label: 'Accounts', href: '/examples/clearbank/app', active: true, icon: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg> },
  { label: 'Transfers', href: '/examples/clearbank/app/transfer', icon: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" /></svg> },
  { label: 'Cards', href: '/examples/clearbank/app', icon: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" /></svg> },
  { label: 'Investments', href: '/examples/clearbank/app', icon: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" /></svg> },
  { label: 'Settings', href: '/examples/clearbank/app', icon: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg> },
]

export default function BankingDashboard() {
  return (
    <AppShell config={{ sidebarWidth: '15rem', sidebarCollapsible: true }}>
      <AppShell.Sidebar>
        <div className="flex h-14 items-center gap-2 border-b border-border px-5">
          <Link href="/examples/clearbank" className="text-lg font-bold text-primary">ClearBank</Link>
        </div>
        <nav className="mt-4 space-y-1 px-3">
          {sidebarNavItems.map((item) => (
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
      </AppShell.Sidebar>
      <AppShell.Main>
        <AppShell.Header>
          <div className="flex-1">
            <span className="text-lg font-semibold">Accounts</span>
          </div>
          <div className="flex items-center gap-3">
            <button className="rounded-[var(--radius)] p-1.5 text-muted-foreground hover:bg-muted transition-colors">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
              </svg>
            </button>
            <span className="text-sm text-muted-foreground hidden sm:inline">Alex Morgan</span>
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">AM</div>
          </div>
        </AppShell.Header>
        <AppShell.Content maxWidth="6xl">
          <div className="space-y-8">
            {/* Balance Card */}
            <div className="rounded-[var(--card-radius)] bg-gradient-to-r from-primary to-primary/80 p-8 text-primary-foreground">
              <p className="text-sm opacity-80">Total Balance</p>
              <p className="mt-2 text-4xl font-bold">$24,580.35</p>
              <div className="mt-4 flex items-center gap-2">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" /></svg>
                <span className="text-sm font-medium">+$1,240.00 this month</span>
              </div>
              {/* Mini trend line */}
              <div className="mt-4 flex items-end gap-1 h-8">
                {[30, 45, 35, 55, 40, 60, 50, 70, 65, 80, 75, 85].map((h, i) => (
                  <div key={i} className="flex-1 rounded-t-sm bg-primary-foreground/20" style={{ height: `${h}%` }} />
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid gap-4 sm:grid-cols-4">
              {[
                { label: 'Send Money', href: '/examples/clearbank/app/transfer', icon: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" /></svg> },
                { label: 'Pay Bills', href: '/examples/clearbank/app', icon: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" /></svg> },
                { label: 'Investments', href: '/examples/clearbank/app', icon: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" /></svg> },
                { label: 'Cards', href: '/examples/clearbank/app', icon: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" /></svg> },
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

            <div className="grid gap-8 lg:grid-cols-3">
              {/* Transactions */}
              <div className="lg:col-span-2 rounded-[var(--card-radius)] border border-border bg-card">
                <div className="flex items-center justify-between border-b border-border px-6 py-4">
                  <h2 className="font-semibold">Recent Transactions</h2>
                  <button className="text-sm text-primary font-medium hover:underline">View All</button>
                </div>
                <div className="divide-y divide-border">
                  {transactions.map((tx, i) => (
                    <div key={i} className="flex items-center justify-between px-6 py-3.5 hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs ${tx.amount > 0 ? 'bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]' : 'bg-muted text-muted-foreground'}`}>
                          {tx.amount > 0 ? '+' : '-'}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{tx.desc}</p>
                          <p className="text-xs text-muted-foreground">{tx.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`text-sm font-semibold ${tx.amount > 0 ? 'text-[hsl(var(--success))]' : ''}`}>
                          {tx.amount > 0 ? '+' : ''}{tx.amount < 0 ? '-' : ''}${Math.abs(tx.amount).toFixed(2)}
                        </span>
                        <p className="text-xs text-muted-foreground">
                          <span className="inline-block rounded-full bg-muted px-2 py-0.5">{tx.category}</span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Spending Breakdown */}
              <div className="rounded-[var(--card-radius)] border border-border bg-card p-6">
                <h2 className="font-semibold mb-6">Spending Breakdown</h2>
                <div className="space-y-4">
                  {spending.map((s) => {
                    const total = spending.reduce((a, b) => a + b.amount, 0)
                    const pct = Math.round((s.amount / total) * 100)
                    return (
                      <div key={s.category}>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span>{s.category}</span>
                          <span className="font-medium">${s.amount}</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                          <div className={`h-full rounded-full ${s.color}`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div className="mt-6 pt-4 border-t border-border">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Total</span>
                    <span className="font-bold">${spending.reduce((a, b) => a + b.amount, 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </AppShell.Content>
      </AppShell.Main>
      <AppShell.MobileNav>
        <button className="flex flex-col items-center gap-0.5 text-primary">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
          </svg>
          <span className="text-[10px]">Accounts</span>
        </button>
        <button className="flex flex-col items-center gap-0.5 text-muted-foreground">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
          </svg>
          <span className="text-[10px]">Transfers</span>
        </button>
        <button className="flex flex-col items-center gap-0.5 text-muted-foreground">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
          </svg>
          <span className="text-[10px]">Cards</span>
        </button>
        <button className="flex flex-col items-center gap-0.5 text-muted-foreground">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
          </svg>
          <span className="text-[10px]">Settings</span>
        </button>
      </AppShell.MobileNav>
      <AppShell.Overlay />
      <ThemeConfigPanel defaultConfig={clearbankConfig} />
    </AppShell>
  )
}
