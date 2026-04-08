'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ThemeConfigPanel } from '@/components/theme-config-panel'
import { insightiqConfig } from '../theme-configs'
import { faqs } from './/config'

export default function InsightIQLanding() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="text-xl font-bold text-primary">InsightIQ</span>
          <div className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
            <a href="#faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">FAQ</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/examples/insightiq/app" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Sign In
            </Link>
            <Link href="/examples/insightiq/app" className="rounded-[var(--button-radius)] bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity">
              Start Free Trial
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 py-24 text-center">
        <h1 className="text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
          Analytics that{' '}
          <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
            drive growth
          </span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground leading-relaxed">
          Turn raw data into actionable insights. Real-time dashboards, team collaboration,
          and custom reports that help you make better decisions faster.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Link href="/examples/insightiq/app" className="rounded-[var(--button-radius)] bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-lg hover:opacity-90 transition-opacity">
            Start Free Trial
          </Link>
          <a href="#features" className="rounded-[var(--button-radius)] border border-border px-6 py-3 text-sm font-medium text-foreground hover:bg-muted transition-colors">
            View Demo
          </a>
        </div>
      </section>

      {/* Trusted By */}
      <section className="border-y border-border bg-muted/30 py-10">
        <div className="mx-auto max-w-6xl px-6">
          <p className="text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">Trusted by 2,000+ teams worldwide</p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
            {['Acme Corp', 'Globex Inc', 'Initech', 'Omnicorp', 'Prestige Tech', 'Solaris Group'].map((name) => (
              <span key={name} className="text-lg font-semibold text-muted-foreground/50">{name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-6 py-24">
        <h2 className="text-center text-3xl font-bold tracking-tight">Everything you need to grow</h2>
        <p className="mx-auto mt-4 max-w-xl text-center text-muted-foreground">
          Powerful analytics tools designed for modern teams.
        </p>
        <div className="mt-16 grid gap-8 sm:grid-cols-3">
          {[
            {
              title: 'Real-time Analytics',
              desc: 'Watch your metrics update live. Track visitors, conversions, and revenue as they happen with sub-second latency.',
              icon: (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5m.75-9 3-3 2.148 2.148A12.061 12.061 0 0 1 16.5 7.605" />
                </svg>
              ),
            },
            {
              title: 'Team Collaboration',
              desc: 'Share dashboards, set alerts, and annotate charts. Keep your whole team aligned on what matters most.',
              icon: (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
                </svg>
              ),
            },
            {
              title: 'Custom Reports',
              desc: 'Build pixel-perfect reports with drag-and-drop. Schedule automated exports to your inbox or messaging tools.',
              icon: (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                </svg>
              ),
            },
          ].map((f) => (
            <div key={f.title} className="rounded-[var(--card-radius)] border border-border bg-card p-8 transition-all hover:shadow-md hover:border-primary/30">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-[var(--radius)] bg-primary/10 text-primary">
                {f.icon}
              </div>
              <h3 className="text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="bg-muted/30 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center text-3xl font-bold tracking-tight">Simple, transparent pricing</h2>
          <p className="mx-auto mt-4 max-w-xl text-center text-muted-foreground">
            No hidden fees. No surprises. Start free and scale as you grow.
          </p>
          <div className="mt-16 grid gap-8 sm:grid-cols-3">
            {[
              { name: 'Starter', price: '$29', period: '/mo', desc: 'For small teams getting started', features: ['5 dashboards', '10K events/mo', 'Email support', '7-day data retention', 'Basic integrations'] },
              { name: 'Pro', price: '$79', period: '/mo', desc: 'For growing teams that need more', features: ['Unlimited dashboards', '1M events/mo', 'Priority support', '1-year data retention', 'All integrations', 'Custom reports', 'Team collaboration'], popular: true },
              { name: 'Enterprise', price: 'Custom', period: '', desc: 'For large organizations', features: ['Everything in Pro', 'Unlimited events', 'Dedicated support', 'Unlimited retention', 'SSO & SAML', 'SLA guarantee', 'Custom onboarding'] },
            ].map((plan) => (
              <div key={plan.name} className={`relative rounded-[var(--card-radius)] border bg-card p-8 ${plan.popular ? 'border-primary shadow-lg ring-1 ring-primary/20' : 'border-border'}`}>
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                    Most Popular
                  </span>
                )}
                <h3 className="text-lg font-semibold">{plan.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{plan.desc}</p>
                <div className="mt-6">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
                <ul className="mt-8 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/examples/insightiq/app"
                  className={`mt-8 block w-full rounded-[var(--button-radius)] py-2.5 text-center text-sm font-medium transition-opacity hover:opacity-90 ${plan.popular ? 'bg-primary text-primary-foreground' : 'border border-border text-foreground hover:bg-muted'}`}
                >
                  {plan.price === 'Custom' ? 'Contact Sales' : 'Get Started'}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-3xl px-6 py-24">
        <h2 className="text-center text-3xl font-bold tracking-tight">Frequently asked questions</h2>
        <div className="mt-12 space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="rounded-[var(--card-radius)] border border-border bg-card">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="flex w-full items-center justify-between px-6 py-4 text-left text-sm font-medium text-foreground"
              >
                {faq.q}
                <svg className={`h-5 w-5 text-muted-foreground transition-transform ${openFaq === i ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
              </button>
              {openFaq === i && (
                <div className="border-t border-border px-6 py-4">
                  <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <span className="text-sm text-muted-foreground">&copy; 2026 InsightIQ. All rights reserved.</span>
        </div>
      </footer>

      <ThemeConfigPanel defaultConfig={insightiqConfig} />
    </div>
  )
}
