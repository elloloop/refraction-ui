'use client'

import Link from 'next/link'
import { ThemeDialog } from '../../../theme-dialog'

const themeConfig = `:root {
  --background: 240 10% 4%;
  --foreground: 0 0% 95%;
  --primary: 0 0% 95%;
  --card: 240 10% 6%;
  --border: 240 5% 14%;
  --muted: 240 5% 12%;
  --muted-foreground: 240 5% 55%;
  --radius: 0.25rem;
}`

export default function CaseStudy() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Link href="/examples/portfolio" className="text-lg font-bold tracking-tight">STUDIO.CO</Link>
          <Link href="/examples/portfolio/app" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            All Work
          </Link>
        </div>
      </nav>

      {/* Hero Image */}
      <div className="w-full aspect-[21/9] bg-gradient-to-br from-primary/15 via-primary/5 to-transparent flex items-center justify-center border-b border-border">
        <span className="text-7xl font-bold text-foreground/5">Lumina</span>
      </div>

      <div className="mx-auto max-w-4xl px-6 py-16 space-y-16">
        {/* Project Meta */}
        <div className="grid gap-8 sm:grid-cols-4">
          <div className="sm:col-span-2">
            <h1 className="text-4xl font-bold tracking-tight">Lumina Rebrand</h1>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              A complete brand transformation for a fintech startup transitioning from stealth to market launch.
            </p>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Client</p>
              <p className="text-sm font-medium mt-1">Lumina Finance</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Year</p>
              <p className="text-sm font-medium mt-1">2025</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Role</p>
              <p className="text-sm font-medium mt-1">Brand Strategy, Visual Identity, Web Design</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Duration</p>
              <p className="text-sm font-medium mt-1">12 Weeks</p>
            </div>
          </div>
        </div>

        {/* Challenge */}
        <div className="space-y-6">
          <div>
            <span className="text-xs uppercase tracking-wider text-muted-foreground font-mono">01</span>
            <h2 className="mt-2 text-2xl font-bold">The Challenge</h2>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            Lumina Finance had spent two years in stealth mode building an innovative payment platform. As they prepared for their public launch, they needed a brand identity that would communicate trust, innovation, and accessibility to both consumers and enterprise clients.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Their existing visual identity was functional but lacked the polish and coherence needed to stand out in a crowded fintech market. The challenge was to create a brand system that felt both cutting-edge and trustworthy.
          </p>
        </div>

        {/* Image */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="aspect-[4/3] rounded-[var(--card-radius)] bg-gradient-to-br from-primary/10 to-transparent border border-border flex items-center justify-center">
            <span className="text-2xl font-bold text-foreground/10">Before</span>
          </div>
          <div className="aspect-[4/3] rounded-[var(--card-radius)] bg-gradient-to-br from-[hsl(var(--chart-2))]/10 to-transparent border border-border flex items-center justify-center">
            <span className="text-2xl font-bold text-foreground/10">After</span>
          </div>
        </div>

        {/* Approach */}
        <div className="space-y-6">
          <div>
            <span className="text-xs uppercase tracking-wider text-muted-foreground font-mono">02</span>
            <h2 className="mt-2 text-2xl font-bold">Our Approach</h2>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            We began with a comprehensive discovery phase, interviewing stakeholders, analyzing competitors, and mapping the customer journey. This research informed a strategic brand framework that guided all creative decisions.
          </p>
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              { title: 'Discovery', desc: 'Stakeholder interviews, competitive analysis, and audience research to define brand positioning.' },
              { title: 'Strategy', desc: 'Brand architecture, messaging framework, and visual direction based on research insights.' },
              { title: 'Execution', desc: 'Logo design, typography system, color palette, and comprehensive brand guidelines.' },
            ].map((step) => (
              <div key={step.title} className="rounded-[var(--card-radius)] border border-border bg-card p-5">
                <h3 className="text-sm font-semibold">{step.title}</h3>
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Image Gallery */}
        <div className="grid gap-4 grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="aspect-square rounded-[var(--card-radius)] bg-gradient-to-br from-muted to-card border border-border flex items-center justify-center">
              <span className="text-sm text-muted-foreground/30">Gallery {i}</span>
            </div>
          ))}
        </div>
        <div className="aspect-[21/9] rounded-[var(--card-radius)] bg-gradient-to-r from-primary/10 via-[hsl(var(--chart-2))]/10 to-[hsl(var(--chart-4))]/10 border border-border flex items-center justify-center">
          <span className="text-lg text-muted-foreground/20">Wide Format</span>
        </div>

        {/* Result */}
        <div className="space-y-6">
          <div>
            <span className="text-xs uppercase tracking-wider text-muted-foreground font-mono">03</span>
            <h2 className="mt-2 text-2xl font-bold">The Result</h2>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            The new brand identity launched alongside Lumina&apos;s public debut. The response was overwhelmingly positive, with the rebrand cited as a key factor in their successful Series A fundraise of $18M.
          </p>
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="rounded-[var(--card-radius)] border border-border bg-card p-6 text-center">
              <p className="text-3xl font-bold">340%</p>
              <p className="text-xs text-muted-foreground mt-1">Increase in brand recall</p>
            </div>
            <div className="rounded-[var(--card-radius)] border border-border bg-card p-6 text-center">
              <p className="text-3xl font-bold">$18M</p>
              <p className="text-xs text-muted-foreground mt-1">Series A raised</p>
            </div>
            <div className="rounded-[var(--card-radius)] border border-border bg-card p-6 text-center">
              <p className="text-3xl font-bold">4.9/5</p>
              <p className="text-xs text-muted-foreground mt-1">Client satisfaction</p>
            </div>
          </div>
        </div>

        {/* Next Project */}
        <div className="border-t border-border pt-12">
          <Link
            href="/examples/portfolio/app"
            className="group flex items-center justify-between"
          >
            <div>
              <span className="text-xs uppercase tracking-wider text-muted-foreground">Next Project</span>
              <p className="mt-1 text-2xl font-bold group-hover:text-primary transition-colors">Horizon Dashboard</p>
            </div>
            <svg className="h-8 w-8 text-muted-foreground group-hover:text-foreground group-hover:translate-x-2 transition-all" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
      </div>

      <ThemeDialog themeName="Portfolio Case Study" themeConfig={themeConfig} />
    </div>
  )
}
