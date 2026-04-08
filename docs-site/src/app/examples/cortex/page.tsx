'use client'

import Link from 'next/link'
import { ThemeConfigPanel } from '@/components/theme-config-panel'
import { cortexConfig } from '../theme-configs'
import { capabilities, pricingPlans } from './config'

export default function CortexLandingPage() {
  return (
    <div
      className="min-h-screen bg-background text-foreground"
    >
      {/* Nav */}
      <nav className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
              <svg className="h-5 w-5 text-primary-foreground" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456Z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-foreground">Cortex</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <span className="hover:text-foreground cursor-pointer transition-colors">Features</span>
            <span className="hover:text-foreground cursor-pointer transition-colors">Pricing</span>
            <span className="hover:text-foreground cursor-pointer transition-colors">API</span>
            <span className="hover:text-foreground cursor-pointer transition-colors">Docs</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/examples/cortex/app" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Log in
            </Link>
            <Link
              href="/examples/cortex/app"
              className="rounded-[var(--button-radius)] bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
            >
              Start Chatting
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pt-28 pb-24 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-4 py-1.5 text-sm text-muted-foreground mb-6">
          <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
          </svg>
          Powered by state-of-the-art language models
        </div>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground leading-tight">
          Your intelligent
          <span className="text-gradient bg-gradient-to-r from-primary to-primary/60 block">
            assistant
          </span>
        </h1>
        <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Ask anything, write code, analyze data, and create content. Cortex understands context, remembers your preferences, and gets smarter with every conversation.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4 flex-wrap">
          <Link
            href="/examples/cortex/app"
            className="rounded-[var(--button-radius)] bg-primary px-8 py-3 text-base font-semibold text-primary-foreground hover:opacity-90 transition-opacity shadow-lg shadow-primary/20"
          >
            Start chatting — it&apos;s free
          </Link>
        </div>
      </section>

      {/* Capabilities */}
      <section className="bg-muted/30 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-3xl font-bold text-center text-foreground mb-4">What Cortex can do</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-xl mx-auto">
            From quick answers to complex multi-step tasks, Cortex adapts to how you work.
          </p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {capabilities.map((cap) => (
              <div
                key={cap.title}
                className="rounded-[var(--card-radius)] border border-border bg-card p-6 hover:shadow-md transition-shadow"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  {cap.icon}
                </div>
                <h3 className="text-base font-semibold text-foreground mb-2">{cap.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{cap.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo conversation */}
      <section className="py-20">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">See it in action</h2>
          <div className="rounded-[var(--card-radius)] border border-border bg-card shadow-lg overflow-hidden">
            <div className="border-b border-border bg-muted/30 px-4 py-3 flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-primary/60" />
              <span className="text-sm font-medium text-foreground">Cortex</span>
              <span className="text-xs text-muted-foreground ml-auto">Model: Cortex-4</span>
            </div>
            <div className="p-6 space-y-6">
              {/* User message */}
              <div className="flex justify-end">
                <div className="rounded-[var(--radius)] bg-primary/10 px-4 py-3 max-w-md">
                  <p className="text-sm text-foreground">Write a Python function that finds all prime numbers up to n.</p>
                </div>
              </div>
              {/* Assistant message */}
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                  <svg className="h-4 w-4 text-primary-foreground" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-foreground mb-3">Here is an efficient Sieve of Eratosthenes implementation:</p>
                  <pre className="rounded-[var(--radius)] border border-border bg-muted/70 p-4 overflow-x-auto">
                    <code className="text-xs font-mono text-foreground">{`def sieve_of_eratosthenes(n: int) -> list[int]:
    """Find all prime numbers up to n."""
    if n < 2:
        return []

    is_prime = [True] * (n + 1)
    is_prime[0] = is_prime[1] = False

    for i in range(2, int(n**0.5) + 1):
        if is_prime[i]:
            for j in range(i*i, n + 1, i):
                is_prime[j] = False

    return [i for i in range(n + 1) if is_prime[i]]`}</code>
                  </pre>
                  <p className="text-sm text-foreground mt-3">Time complexity: O(n log log n). This is optimal for generating all primes up to n.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-muted/30 py-20" id="pricing">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-3xl font-bold text-center text-foreground mb-4">Simple pricing</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-xl mx-auto">
            Start for free, upgrade when you need more.
          </p>
          <div className="grid gap-6 md:grid-cols-3 max-w-4xl mx-auto">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-[var(--card-radius)] border bg-card p-6 flex flex-col ${
                  plan.highlighted
                    ? 'border-primary shadow-lg shadow-primary/10 ring-1 ring-primary/20'
                    : 'border-border'
                }`}
              >
                {plan.highlighted && (
                  <span className="inline-block self-start rounded-[var(--badge-radius)] bg-primary px-2.5 py-0.5 text-xs font-medium text-primary-foreground mb-3">
                    Most Popular
                  </span>
                )}
                <h3 className="text-lg font-semibold text-foreground">{plan.name}</h3>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-foreground">{plan.price}</span>
                  <span className="text-sm text-muted-foreground">{plan.period}</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>
                <ul className="mt-6 space-y-2 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-foreground">
                      <svg className="h-4 w-4 text-primary shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/examples/cortex/app"
                  className={`mt-6 block text-center rounded-[var(--button-radius)] px-4 py-2.5 text-sm font-medium transition-colors ${
                    plan.highlighted
                      ? 'bg-primary text-primary-foreground hover:opacity-90'
                      : 'border border-border text-foreground hover:bg-muted'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-8 sm:grid-cols-4">
            <div>
              <h4 className="font-semibold text-foreground mb-3">Product</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p className="hover:text-foreground cursor-pointer transition-colors">Features</p>
                <p className="hover:text-foreground cursor-pointer transition-colors">Models</p>
                <p className="hover:text-foreground cursor-pointer transition-colors">Pricing</p>
                <p className="hover:text-foreground cursor-pointer transition-colors">Changelog</p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-3">Developers</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p className="hover:text-foreground cursor-pointer transition-colors">API Docs</p>
                <p className="hover:text-foreground cursor-pointer transition-colors">Libraries</p>
                <p className="hover:text-foreground cursor-pointer transition-colors">Playground</p>
                <p className="hover:text-foreground cursor-pointer transition-colors">Status</p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-3">Company</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p className="hover:text-foreground cursor-pointer transition-colors">About</p>
                <p className="hover:text-foreground cursor-pointer transition-colors">Blog</p>
                <p className="hover:text-foreground cursor-pointer transition-colors">Careers</p>
                <p className="hover:text-foreground cursor-pointer transition-colors">Research</p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-3">Legal</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p className="hover:text-foreground cursor-pointer transition-colors">Privacy</p>
                <p className="hover:text-foreground cursor-pointer transition-colors">Terms</p>
                <Link href="/examples" className="hover:text-foreground transition-colors block">All Examples</Link>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
            Built with refraction-ui. Themed by CSS variables only.
          </div>
        </div>
      </footer>

      <ThemeConfigPanel defaultConfig={cortexConfig} />
    </div>
  )
}
