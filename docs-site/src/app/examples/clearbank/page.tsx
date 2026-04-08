'use client'

import Link from 'next/link'
import { ThemeConfigPanel } from '@/components/theme-config-panel'
import { clearbankConfig } from '../theme-configs'
import { mockTransactions } from './/config'

export default function ClearBankLanding() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="text-xl font-bold text-primary">ClearBank</span>
          <div className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#security" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Security</a>
            <a href="#app" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Mobile App</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/examples/clearbank/app" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Sign In
            </Link>
            <Link href="/examples/clearbank/app" className="rounded-[var(--button-radius)] bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity">
              Open Account
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="grid gap-12 lg:grid-cols-2 items-center">
          <div>
            <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
              Banking{' '}
              <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                reimagined
              </span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
              A modern banking experience built for the way you live. Instant transfers, smart savings, and powerful investment tools at your fingertips.
            </p>
            <div className="mt-10 flex gap-4">
              <Link href="/examples/clearbank/app" className="rounded-[var(--button-radius)] bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-lg hover:opacity-90 transition-opacity">
                Open Account
              </Link>
              <a href="#features" className="rounded-[var(--button-radius)] border border-border px-6 py-3 text-sm font-medium text-foreground hover:bg-muted transition-colors">
                Learn More
              </a>
            </div>
          </div>
          {/* Mobile app mockup */}
          <div className="hidden lg:flex justify-center">
            <div className="w-64 rounded-[2rem] border-4 border-foreground/10 bg-card p-4 shadow-xl">
              <div className="rounded-[1.5rem] bg-gradient-to-b from-primary/10 to-transparent p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Total Balance</span>
                  <div className="h-6 w-6 rounded-full bg-primary/20" />
                </div>
                <p className="text-2xl font-bold">$24,580.35</p>
                <div className="flex gap-2">
                  <div className="flex-1 rounded-[var(--radius)] bg-primary/10 p-2 text-center">
                    <p className="text-xs text-muted-foreground">Send</p>
                  </div>
                  <div className="flex-1 rounded-[var(--radius)] bg-primary/10 p-2 text-center">
                    <p className="text-xs text-muted-foreground">Request</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {mockTransactions.map((t) => (
                    <div key={t} className="flex items-center justify-between rounded-[var(--radius)] bg-background/50 p-2">
                      <span className="text-xs">{t}</span>
                      <span className="text-xs font-medium">-$12.50</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-muted/30 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center text-3xl font-bold tracking-tight">Everything you need from a bank</h2>
          <p className="mx-auto mt-4 max-w-xl text-center text-muted-foreground">
            Modern banking features designed around your lifestyle.
          </p>
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { title: 'Instant Transfers', desc: 'Send money to anyone in seconds. No fees, no waiting.', icon: <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5 7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" /></svg> },
              { title: 'Smart Savings', desc: 'AI-powered savings goals that learn your spending habits.', icon: <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" /></svg> },
              { title: 'Investment Tools', desc: 'Build wealth with fractional shares, ETFs, and crypto.', icon: <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" /></svg> },
              { title: '24/7 Support', desc: 'Get help anytime via chat, phone, or email.', icon: <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" /></svg> },
            ].map((f) => (
              <div key={f.title} className="rounded-[var(--card-radius)] border border-border bg-card p-6 transition-all hover:shadow-md hover:border-primary/30">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-[var(--radius)] bg-primary/10 text-primary">
                  {f.icon}
                </div>
                <h3 className="font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security */}
      <section id="security" className="mx-auto max-w-6xl px-6 py-24">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight">Bank-grade security</h2>
          <p className="mt-4 text-muted-foreground">Your money is protected by industry-leading security measures.</p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {[
            { title: '256-bit Encryption', desc: 'Military-grade encryption for all data in transit and at rest.' },
            { title: 'FDIC Insured', desc: 'Deposits insured up to $250,000 through our banking partners.' },
            { title: 'Biometric Auth', desc: 'Face ID, Touch ID, and two-factor authentication built in.' },
          ].map((s) => (
            <div key={s.title} className="flex gap-4 rounded-[var(--card-radius)] border border-border bg-card p-6">
              <div className="h-10 w-10 flex-shrink-0 rounded-full bg-[hsl(var(--success))]/10 flex items-center justify-center">
                <svg className="h-5 w-5 text-[hsl(var(--success))]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold">{s.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Mobile App CTA */}
      <section id="app" className="bg-primary/5 py-24">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-3xl font-bold tracking-tight">Download the app</h2>
          <p className="mt-4 text-muted-foreground">Bank on the go. Available on iOS and Android.</p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <button className="rounded-[var(--button-radius)] bg-foreground px-6 py-3 text-sm font-medium text-background hover:opacity-90 transition-opacity">
              App Store
            </button>
            <button className="rounded-[var(--button-radius)] bg-foreground px-6 py-3 text-sm font-medium text-background hover:opacity-90 transition-opacity">
              Google Play
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <span className="text-sm text-muted-foreground">&copy; 2026 ClearBank. All rights reserved. FDIC insured through partner banks.</span>
        </div>
      </footer>

      <ThemeConfigPanel defaultConfig={clearbankConfig} />
    </div>
  )
}
