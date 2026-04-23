'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ThemeConfigPanel } from '@/components/theme-config-panel'
import { clearbankConfig } from '../../../theme-configs'
import { recentRecipients, quickAmounts } from '../../config'
import { ClearbankLogo } from '@/components/logos';


const themeConfig = `:root {
  --primary: 220 70% 45%;
  --background: 0 0% 99%;
  --card: 0 0% 100%;
  --border: 220 10% 91%;
}`

export default function TransferMoney() {
  const [fromAccount, setFromAccount] = useState('checking')
  const [amount, setAmount] = useState('')
  const [recipient, setRecipient] = useState('')
  const [search, setSearch] = useState('')
  const [selectedRecipient, setSelectedRecipient] = useState<string | null>(null)

  const filteredRecipients = recentRecipients.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase()) || r.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Link href="/examples/clearbank" className="text-xl font-bold text-primary"><ClearbankLogo className="h-6 w-auto" /></Link>
          <Link href="/examples/clearbank/app" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Back to Dashboard
          </Link>
        </div>
      </nav>

      <div className="mx-auto max-w-3xl px-6 py-8 space-y-8">
        <div>
          <h1 className="text-2xl font-bold">Send Money</h1>
          <p className="mt-1 text-muted-foreground">Transfer funds instantly to anyone.</p>
        </div>

        {/* From Account */}
        <div className="space-y-3">
          <label className="block text-sm font-medium">From Account</label>
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              onClick={() => setFromAccount('checking')}
              className={`flex items-center gap-3 rounded-[var(--card-radius)] border p-4 text-left transition-all ${
                fromAccount === 'checking' ? 'border-primary bg-primary/5 ring-1 ring-primary/20' : 'border-border bg-card hover:border-primary/30'
              }`}
            >
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium">Checking Account</p>
                <p className="text-xs text-muted-foreground">$24,580.35 available</p>
              </div>
            </button>
            <button
              onClick={() => setFromAccount('savings')}
              className={`flex items-center gap-3 rounded-[var(--card-radius)] border p-4 text-left transition-all ${
                fromAccount === 'savings' ? 'border-primary bg-primary/5 ring-1 ring-primary/20' : 'border-border bg-card hover:border-primary/30'
              }`}
            >
              <div className="h-10 w-10 rounded-full bg-[hsl(var(--success))]/10 flex items-center justify-center">
                <svg className="h-5 w-5 text-[hsl(var(--success))]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium">Savings Account</p>
                <p className="text-xs text-muted-foreground">$12,350.00 available</p>
              </div>
            </button>
          </div>
        </div>

        {/* Amount */}
        <div className="space-y-3">
          <label className="block text-sm font-medium">Amount</label>
          <div className="flex items-center justify-center rounded-[var(--card-radius)] border border-border bg-card p-8">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                <span className="text-3xl font-bold text-muted-foreground">$</span>
                <input
                  type="text"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
                  placeholder="0.00"
                  className="w-48 bg-transparent text-center text-5xl font-bold text-foreground placeholder:text-muted-foreground/30 focus:outline-none"
                />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Available: ${fromAccount === 'checking' ? '24,580.35' : '12,350.00'}
              </p>
            </div>
          </div>
          <div className="flex justify-center gap-2">
            {quickAmounts.map((preset) => (
              <button
                key={preset}
                onClick={() => setAmount(preset)}
                className="rounded-full border border-border px-4 py-1.5 text-sm font-medium hover:bg-muted transition-colors"
              >
                ${preset}
              </button>
            ))}
          </div>
        </div>

        {/* Recipient */}
        <div className="space-y-3">
          <label className="block text-sm font-medium">To Recipient</label>
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full rounded-[var(--input-radius)] border border-border bg-background pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        {/* Recent Recipients */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Recent Recipients</h3>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {filteredRecipients.map((r) => (
              <button
                key={r.name}
                onClick={() => { setSelectedRecipient(r.name); setSearch(r.name); }}
                className={`flex flex-col items-center gap-2 flex-shrink-0 ${selectedRecipient === r.name ? 'opacity-100' : 'opacity-70 hover:opacity-100'} transition-opacity`}
              >
                <div className={`h-14 w-14 rounded-full flex items-center justify-center text-sm font-bold ${
                  selectedRecipient === r.name ? 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2 ring-offset-background' : 'bg-primary/10 text-primary'
                }`}>
                  {r.initials}
                </div>
                <span className="text-xs font-medium w-16 text-center truncate">{r.name.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Send Button */}
        <button
          className="w-full rounded-[var(--button-radius)] bg-primary px-6 py-3.5 text-sm font-medium text-primary-foreground shadow-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!amount || !selectedRecipient}
        >
          {amount && selectedRecipient
            ? `Send $${parseFloat(amount || '0').toFixed(2)} to ${selectedRecipient.split(' ')[0]}`
            : 'Enter amount and select recipient'
          }
        </button>
      </div>

      <ThemeConfigPanel defaultConfig={clearbankConfig} />
    </div>
  )
}
