'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ThemeConfigPanel } from '@/components/theme-config-panel'
import { studioxConfig } from '../../theme-configs'

const projects = [
  { title: 'Lumina Rebrand', category: 'Branding', desc: 'Complete brand identity redesign for a fintech startup that needed to evolve its visual language.', color: 'from-primary/20 via-primary/10 to-transparent' },
  { title: 'Horizon Dashboard', category: 'Web', desc: 'Enterprise analytics dashboard with real-time data visualization and team collaboration features.', color: 'from-[hsl(var(--chart-2))]/20 via-[hsl(var(--chart-2))]/10 to-transparent' },
  { title: 'Pulse Mobile App', category: 'Mobile', desc: 'Health and fitness app with AI-powered workout recommendations and progress tracking.', color: 'from-[hsl(var(--chart-4))]/20 via-[hsl(var(--chart-4))]/10 to-transparent' },
  { title: 'Vertex Campaign', category: 'Marketing', desc: 'Integrated multi-channel campaign for a B2B product launch reaching 2M+ impressions.', color: 'from-[hsl(var(--chart-3))]/20 via-[hsl(var(--chart-3))]/10 to-transparent' },
  { title: 'Cascade E-Commerce', category: 'Web', desc: 'Custom Shopify storefront for a DTC fashion brand with 3D product previews.', color: 'from-[hsl(var(--chart-5))]/20 via-[hsl(var(--chart-5))]/10 to-transparent' },
  { title: 'Atlas Brand Identity', category: 'Branding', desc: 'Visual identity system for a travel technology company, including logo, typography, and guidelines.', color: 'from-[hsl(var(--warning))]/20 via-[hsl(var(--warning))]/10 to-transparent' },
  { title: 'Flux iOS App', category: 'Mobile', desc: 'Social networking app for creative professionals with portfolio sharing and hiring features.', color: 'from-primary/20 via-primary/10 to-transparent' },
  { title: 'Nova Growth', category: 'Marketing', desc: 'Performance marketing strategy that increased conversion rates by 340% for a SaaS startup.', color: 'from-[hsl(var(--chart-2))]/20 via-[hsl(var(--chart-2))]/10 to-transparent' },
]

const filters = ['All', 'Branding', 'Web', 'Mobile', 'Marketing']

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

export default function WorkShowcase() {
  const [activeFilter, setActiveFilter] = useState('All')

  const filtered = activeFilter === 'All' ? projects : projects.filter((p) => p.category === activeFilter)

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Link href="/examples/studiox" className="text-lg font-bold tracking-tight">STUDIO X</Link>
          <Link href="/examples/studiox" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Back to Home
          </Link>
        </div>
      </nav>

      <div className="mx-auto max-w-6xl px-6 py-12 space-y-12">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Our Work</h1>
          <p className="mt-3 text-muted-foreground max-w-lg">
            A selection of projects that showcase our approach to design and technology.
          </p>
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${
                activeFilter === f ? 'bg-foreground text-background' : 'border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Project Grid */}
        <div className="grid gap-8 sm:grid-cols-2">
          {filtered.map((project) => (
            <Link
              key={project.title}
              href="/examples/studiox/app/project"
              className="group rounded-[var(--card-radius)] border border-border bg-card overflow-hidden transition-all hover:border-foreground/20"
            >
              <div className={`aspect-[16/10] bg-gradient-to-br ${project.color} flex items-center justify-center`}>
                <span className="text-5xl font-bold text-foreground/5 group-hover:text-foreground/10 transition-colors">{project.title.split(' ')[0]}</span>
              </div>
              <div className="p-6">
                <span className="text-xs uppercase tracking-wider text-muted-foreground">{project.category}</span>
                <h3 className="mt-2 text-xl font-semibold group-hover:text-primary transition-colors">{project.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{project.desc}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-foreground group-hover:gap-2 transition-all">
                  View Case Study
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                  </svg>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <ThemeConfigPanel defaultConfig={studioxConfig} />
    </div>
  )
}
