'use client'

import Link from 'next/link'
import { useState } from 'react'
import { PageShell } from '@refraction-ui/react-app-shell'
import { ThemeConfigPanel } from '@/components/theme-config-panel'
import { studioxConfig } from '../../theme-configs'
import { projects, filters } from '../config'

export default function WorkShowcase() {
  const [activeFilter, setActiveFilter] = useState('All')

  const filtered = activeFilter === 'All' ? projects : projects.filter((p) => p.category === activeFilter)

  return (
    <PageShell config={{ navSticky: true, maxWidth: '72rem' }}>
      {/* Nav */}
      <PageShell.Nav className="justify-between bg-background/80 backdrop-blur-sm">
        <Link href="/examples/studiox" className="text-lg font-bold tracking-tight">STUDIO X</Link>
        <Link href="/examples/studiox" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          Back to Home
        </Link>
      </PageShell.Nav>

      <PageShell.Section maxWidth="6xl">
        <div className="space-y-12">
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
      </PageShell.Section>

      <ThemeConfigPanel defaultConfig={studioxConfig} />
    </PageShell>
  )
}
