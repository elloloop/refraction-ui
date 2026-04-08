'use client'

import Link from 'next/link'
import { ThemeConfigPanel } from '@/components/theme-config-panel'
import { clearbankConfig } from '../../theme-configs'

const transactions = [
  { date: 'Apr 5', desc: 'Whole Foods Market', category: 'Groceries', amount: -82.45 },
  { date: 'Apr 5', desc: 'Salary Deposit - Acme Corp', category: 'Income', amount: 4250.00 },
  { date: 'Apr 4', desc: 'Streaming Subscription', category: 'Entertainment', amount: -15.99 },
  { date: 'Apr 4', desc: 'Ride Share', category: 'Transport', amount: -23.50 },
  { date: 'Apr 3', desc: 'Transfer to Savings', category: 'Transfer', amount: -500.00 },
  { date: 'Apr 3', desc: 'Amazon.com', category: 'Shopping', amount: -67.89 },
  { date: 'Apr 2', desc: 'Starbucks', category: 'Dining', amount: -6.75 },
  { date: 'Apr 2', desc: 'Venmo - Sarah Chen', category: 'Transfer', amount: 45.00 },
  { date: 'Apr 1', desc: 'Rent Payment', category: 'Housing', amount: -1800.00 },
  { date: 'Apr 1', desc: 'Electric Bill', category: 'Utilities', amount: -95.40 },
]

const spending = [
  { category: 'Housing', amount: 1800, color: 'bg-primary' },
  { category: 'Groceries', amount: 420, color: 'bg-[hsl(var(--chart-2))]' },
  { category: 'Transport', amount: 185, color: 'bg-[hsl(var(--chart-3))]' },
  { category: 'Entertainment', amount: 95, color: 'bg-[hsl(var(--chart-4))]' },
  { category: 'Dining', amount: 210, color: 'bg-[hsl(var(--chart-5))]' },
  { category: 'Shopping', amount: 340, color: 'bg-[hsl(var(--warning))]' },
]

const themeConfig = `:root {
  --primary: 220 70% 45%;
  --background: 0 0% 99%;
  --card: 0 0% 100%;
  --border: 220 10% 91%;
}`

export default function BankingDashboard() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/examples/clearbank" className="text-xl font-bold text-primary">ClearBank</Link>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Alex Morgan</span>
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">AM</div>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-6xl px-6 py-8 space-y-8">
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

      <ThemeConfigPanel defaultConfig={clearbankConfig} />
    </div>
  )
}
