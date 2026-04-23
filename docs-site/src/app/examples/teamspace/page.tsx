'use client'

import Link from 'next/link'
import { ThemeConfigPanel } from '@/components/theme-config-panel'
import { teamspaceConfig } from '../theme-configs'
import { features } from './config'
import { previewChannels, socialProofLogos } from './/config'
import { TeamspaceLogo } from '@/components/logos';


export default function TeamspaceLandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground"
    >
      {/* Nav */}
      <nav className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-[var(--radius)] bg-primary flex items-center justify-center">
              <svg className="h-5 w-5 text-primary-foreground" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 8.25h15m-16.5 7.5h15m-1.8-13.5-3.9 19.5m-2.1-19.5-3.9 19.5" />
              </svg>
            </div>
            <span className="text-xl font-bold text-foreground"><TeamspaceLogo className="h-6 w-auto" /></span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <span className="hover:text-foreground cursor-pointer transition-colors">Product</span>
            <span className="hover:text-foreground cursor-pointer transition-colors">Solutions</span>
            <span className="hover:text-foreground cursor-pointer transition-colors">Pricing</span>
            <span className="hover:text-foreground cursor-pointer transition-colors">Resources</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/examples/teamspace/app" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Sign in
            </Link>
            <Link
              href="/examples/teamspace/app"
              className="rounded-[var(--button-radius)] bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pt-24 pb-20 text-center">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground leading-tight">
          Where teams
          <span className="text-gradient bg-gradient-to-r from-primary to-primary/60 block">
            come together
          </span>
        </h1>
        <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Teamspace brings your team together with channels, messages, and integrations that make work simpler, more pleasant, and more productive.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4 flex-wrap">
          <Link
            href="/examples/teamspace/app"
            className="rounded-[var(--button-radius)] bg-primary px-8 py-3 text-base font-semibold text-primary-foreground hover:opacity-90 transition-opacity shadow-lg shadow-primary/20"
          >
            Get Started Free
          </Link>
          <Link
            href="/examples/teamspace/app"
            className="rounded-[var(--button-radius)] border border-border bg-card px-8 py-3 text-base font-semibold text-foreground hover:bg-muted transition-colors"
          >
            See Demo
          </Link>
        </div>
      </section>

      {/* App preview */}
      <section className="mx-auto max-w-5xl px-6 pb-20">
        <div className="rounded-[var(--card-radius)] border border-border bg-card shadow-xl overflow-hidden">
          <div className="border-b border-border bg-muted/30 px-4 py-2.5 flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="h-3 w-3 rounded-full bg-destructive/60" />
              <div className="h-3 w-3 rounded-full bg-warning/60" />
              <div className="h-3 w-3 rounded-full bg-success/60" />
            </div>
          </div>
          <div className="flex h-64 md:h-80">
            <div className="w-16 md:w-56 bg-[hsl(var(--sidebar-background))] shrink-0 p-3">
              <div className="space-y-1.5">
                {previewChannels.map((ch) => (
                  <div key={ch} className="text-xs md:text-sm text-white/60 px-2 py-1 rounded truncate">{ch}</div>
                ))}
              </div>
            </div>
            <div className="flex-1 p-4 space-y-3">
              {[
                { name: 'Sarah K.', msg: 'Just deployed the new API endpoint!' },
                { name: 'Mike R.', msg: 'Nice! The tests are all passing.' },
                { name: 'Lisa M.', msg: 'Can we review the PR before EOD?' },
              ].map((m) => (
                <div key={m.name} className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-[var(--radius)] bg-muted shrink-0" />
                  <div>
                    <span className="text-sm font-semibold text-foreground">{m.name}</span>
                    <p className="text-sm text-muted-foreground">{m.msg}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-muted/30 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-3xl font-bold text-center text-foreground mb-4">Everything your team needs</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-xl mx-auto">
            From quick messages to complex workflows, Teamspace has the tools to keep your team moving.
          </p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-[var(--card-radius)] border border-border bg-card p-6 hover:shadow-md transition-shadow"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-[var(--radius)] bg-primary/10 text-primary">
                  {f.icon}
                </div>
                <h3 className="text-base font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
            Trusted worldwide
          </p>
          <p className="text-4xl font-bold text-foreground mb-6">750,000+ companies</p>
          <p className="text-muted-foreground max-w-lg mx-auto">
            From startups to Fortune 100, teams of every size rely on Teamspace to stay connected and productive.
          </p>
          <div className="mt-10 flex items-center justify-center gap-8 flex-wrap">
            {socialProofLogos.map((co) => (
              <span key={co} className="text-lg font-semibold text-muted-foreground/50">{co}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/20 py-12">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-8 sm:grid-cols-4">
            <div>
              <h4 className="font-semibold text-foreground mb-3">Product</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p className="hover:text-foreground cursor-pointer transition-colors">Features</p>
                <p className="hover:text-foreground cursor-pointer transition-colors">Channels</p>
                <p className="hover:text-foreground cursor-pointer transition-colors">Integrations</p>
                <p className="hover:text-foreground cursor-pointer transition-colors">Security</p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-3">Solutions</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p className="hover:text-foreground cursor-pointer transition-colors">Engineering</p>
                <p className="hover:text-foreground cursor-pointer transition-colors">Sales</p>
                <p className="hover:text-foreground cursor-pointer transition-colors">Marketing</p>
                <p className="hover:text-foreground cursor-pointer transition-colors">Support</p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-3">Resources</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p className="hover:text-foreground cursor-pointer transition-colors">Blog</p>
                <p className="hover:text-foreground cursor-pointer transition-colors">Developers</p>
                <p className="hover:text-foreground cursor-pointer transition-colors">Community</p>
                <p className="hover:text-foreground cursor-pointer transition-colors">Events</p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-3">Company</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p className="hover:text-foreground cursor-pointer transition-colors">About</p>
                <p className="hover:text-foreground cursor-pointer transition-colors">Careers</p>
                <p className="hover:text-foreground cursor-pointer transition-colors">Press</p>
                <Link href="/examples" className="hover:text-foreground transition-colors block">All Examples</Link>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
            Built with refraction-ui. Themed by CSS variables only.
          </div>
        </div>
      </footer>

      <ThemeConfigPanel defaultConfig={teamspaceConfig} />
    </div>
  )
}
