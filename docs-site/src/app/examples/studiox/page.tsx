'use client'

import Link from 'next/link'
import { ThemeConfigPanel } from '@/components/theme-config-panel'
import { studioxConfig } from '../theme-configs'
import { works, services } from './config'

export default function StudioXLanding() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-background/50 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <span className="text-lg font-bold tracking-tight">STUDIO X</span>
          <div className="hidden items-center gap-8 md:flex">
            <a href="#work" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Work</a>
            <a href="#about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">About</a>
            <a href="#services" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Services</a>
            <a href="#contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Contact</a>
          </div>
          <Link href="/examples/studiox/app" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            All Work
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="min-h-screen flex flex-col justify-center px-6">
        <div className="mx-auto max-w-6xl w-full">
          <h1 className="text-6xl font-bold tracking-tighter sm:text-7xl lg:text-[8rem] leading-[0.9]">
            STUDIO
            <span className="block text-muted-foreground">.CO</span>
          </h1>
          <p className="mt-8 max-w-md text-lg text-muted-foreground leading-relaxed">
            We create digital experiences that inspire. Strategy, design, and technology working together.
          </p>
          <div className="mt-12 flex gap-6">
            <Link href="/examples/studiox/app" className="rounded-[var(--button-radius)] bg-foreground px-6 py-3 text-sm font-medium text-background hover:opacity-90 transition-opacity">
              View Our Work
            </Link>
            <a href="#contact" className="rounded-[var(--button-radius)] border border-border px-6 py-3 text-sm font-medium text-foreground hover:bg-muted transition-colors">
              Get in Touch
            </a>
          </div>
        </div>
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <span className="text-xs text-muted-foreground uppercase tracking-widest">Scroll</span>
          <div className="h-8 w-px bg-border" />
        </div>
      </section>

      {/* Selected Works */}
      <section id="work" className="mx-auto max-w-6xl px-6 py-24">
        <div className="flex items-center justify-between mb-16">
          <h2 className="text-3xl font-bold tracking-tight">Selected Works</h2>
          <Link href="/examples/studiox/app" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            View All
          </Link>
        </div>
        <div className="grid gap-8 sm:grid-cols-2">
          {works.map((work) => (
            <Link
              key={work.title}
              href="/examples/studiox/app/project"
              className="group rounded-[var(--card-radius)] border border-border bg-card overflow-hidden transition-all hover:border-foreground/20"
            >
              <div className={`aspect-[4/3] bg-gradient-to-br ${work.color} flex items-center justify-center`}>
                <span className="text-4xl font-bold text-foreground/10">{work.title.split(' ')[0]}</span>
              </div>
              <div className="p-6">
                <span className="text-xs uppercase tracking-wider text-muted-foreground">{work.category}</span>
                <h3 className="mt-2 text-xl font-semibold group-hover:text-primary transition-colors">{work.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{work.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* About */}
      <section id="about" className="border-y border-border py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div className="aspect-square rounded-[var(--card-radius)] bg-gradient-to-br from-muted to-card border border-border flex items-center justify-center">
              <span className="text-6xl font-bold text-muted-foreground/20">TEAM</span>
            </div>
            <div>
              <h2 className="text-3xl font-bold tracking-tight">About Us</h2>
              <p className="mt-6 text-muted-foreground leading-relaxed">
                We are a team of 12 designers, developers, and strategists based in San Francisco. Founded in 2018, we have helped over 80 companies transform their digital presence.
              </p>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                Our approach is collaborative and iterative. We believe great design comes from understanding the problem deeply, exploring many solutions, and refining relentlessly.
              </p>
              <div className="mt-8 grid grid-cols-3 gap-4">
                <div>
                  <p className="text-2xl font-bold">80+</p>
                  <p className="text-xs text-muted-foreground">Projects Shipped</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">12</p>
                  <p className="text-xs text-muted-foreground">Team Members</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">8</p>
                  <p className="text-xs text-muted-foreground">Years Active</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="mx-auto max-w-6xl px-6 py-24">
        <h2 className="text-3xl font-bold tracking-tight mb-16">Services</h2>
        <div className="grid gap-0 border-t border-border">
          {services.map((s, i) => (
            <div key={s.title} className="flex items-start gap-8 border-b border-border py-8">
              <span className="text-sm text-muted-foreground font-mono w-8">0{i + 1}</span>
              <div>
                <h3 className="text-xl font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed max-w-lg">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Contact CTA */}
      <section id="contact" className="border-t border-border py-24">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Let&apos;s work together
          </h2>
          <p className="mt-6 text-muted-foreground leading-relaxed">
            Have a project in mind? We would love to hear about it. Drop us a line and let&apos;s create something amazing.
          </p>
          <a href="mailto:hello@studiox.co" className="mt-8 inline-block text-xl font-medium text-foreground underline underline-offset-4 hover:no-underline transition-all">
            hello@studiox.co
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="mx-auto max-w-6xl px-6 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">&copy; 2026 STUDIO X</span>
          <div className="flex gap-6">
            <span className="text-xs text-muted-foreground hover:text-foreground cursor-pointer transition-colors">Twitter</span>
            <span className="text-xs text-muted-foreground hover:text-foreground cursor-pointer transition-colors">Social</span>
            <span className="text-xs text-muted-foreground hover:text-foreground cursor-pointer transition-colors">Dribbble</span>
          </div>
        </div>
      </footer>

      <ThemeConfigPanel defaultConfig={studioxConfig} />
    </div>
  )
}
