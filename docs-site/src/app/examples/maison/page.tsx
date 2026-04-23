'use client'

import { useState } from 'react'
import Link from 'next/link'
import { PageShell } from '@refraction-ui/react-app-shell'
import { ThemeConfigPanel } from '@/components/theme-config-panel'
import { maisonConfig } from '../theme-configs'
import { featuredProducts } from './config'
import { MaisonLogo } from '@/components/logos';


export default function MaisonLandingPage() {
  const [email, setEmail] = useState('')

  return (
    <PageShell config={{ maxWidth: '72rem', navTransparent: true, navSticky: false }}>
      {/* Navigation */}
      <PageShell.Nav className="justify-between py-6">
        <span className="text-sm tracking-[0.2em] uppercase text-muted-foreground"><MaisonLogo className="h-6 w-auto" /></span>
        <div className="flex items-center gap-8">
          <Link href="/examples/maison/app" className="text-xs tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground transition-colors">Collection</Link>
          <Link href="/examples/maison/app/product" className="text-xs tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground transition-colors">Atelier</Link>
        </div>
      </PageShell.Nav>

      {/* Hero */}
      <PageShell.Section maxWidth="3xl" className="py-24">
        <div className="text-center space-y-12">
          <div className="h-80 mx-auto max-w-md rounded-[var(--card-radius)] bg-gradient-to-b from-muted/50 to-accent/30 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <svg className="h-16 w-16 mx-auto mb-3 opacity-30" fill="none" viewBox="0 0 24 24" strokeWidth={0.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
              </svg>
              <span className="text-sm tracking-wider">Campaign Image</span>
            </div>
          </div>
          <div className="space-y-6">
            <h1 className="text-4xl font-light tracking-tight text-foreground" style={{ letterSpacing: 'var(--letter-spacing-tight)', fontWeight: 'var(--font-weight-normal)' }}><MaisonLogo className="h-6 w-auto" /></h1>
            <p className="text-muted-foreground text-lg font-light leading-relaxed max-w-lg mx-auto">
              Crafted for the exceptional. A legacy of exquisite artistry.
            </p>
            <Link
              href="/examples/maison/app"
              className="inline-block text-xs tracking-[0.15em] uppercase text-foreground border-b border-foreground/30 pb-1 hover:border-foreground transition-colors"
            >
              Discover the Collection
            </Link>
          </div>
        </div>
      </PageShell.Section>

      {/* Featured Products */}
      <PageShell.Section maxWidth="4xl" className="py-24">
        <div className="grid md:grid-cols-3 gap-12">
          {featuredProducts.map((product) => (
            <Link key={product.name} href="/examples/maison/app/product" className="group space-y-6">
              <div className="aspect-[3/4] rounded-[var(--card-radius)] bg-gradient-to-b from-muted/30 to-accent/20 border border-border/30 flex items-center justify-center group-hover:border-border/60 transition-colors">
                <div className="text-center text-muted-foreground">
                  <svg className="h-10 w-10 mx-auto mb-2 opacity-20" fill="none" viewBox="0 0 24 24" strokeWidth={0.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
                  </svg>
                  <span className="text-xs tracking-wider">{product.category}</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs tracking-[0.1em] uppercase text-muted-foreground">{product.category}</p>
                <h3 className="text-foreground font-light">{product.name}</h3>
                <p className="text-sm text-muted-foreground">{product.price}</p>
              </div>
            </Link>
          ))}
        </div>
      </PageShell.Section>

      {/* Brand Story */}
      <PageShell.Section maxWidth="2xl" background="muted" className="py-24">
        <div className="text-center space-y-8">
          <h2 className="text-3xl font-light text-foreground" style={{ letterSpacing: 'var(--letter-spacing-tight)' }}>
            The Art of Distinction
          </h2>
          <p className="text-muted-foreground leading-relaxed text-lg font-light">
            Founded in 1892 in the heart of Paris, Maison Eclat has cultivated an unwavering dedication to the art of fine craftsmanship. Every piece represents hundreds of hours of meticulous handwork by our master artisans, carrying forward a tradition that spans four generations.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            We believe that true luxury is not merely about materials or price, but about the invisible thread that connects intention, craft, and the person who will carry our work into the world. Each creation is a conversation between past and future.
          </p>
        </div>
      </PageShell.Section>

      {/* Newsletter */}
      <PageShell.Section maxWidth="md" className="py-24">
        <div className="text-center space-y-6">
          <h2 className="text-lg font-light text-foreground">Stay Informed</h2>
          <p className="text-sm text-muted-foreground">
            Receive exclusive previews and invitations to private events.
          </p>
          <div className="flex gap-3">
            <input
              type="email"
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 rounded-[var(--input-radius)] border border-input bg-background px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground/[var(--placeholder-opacity)] h-[var(--input-height)]"
            />
            <button className="rounded-[var(--button-radius)] bg-foreground px-5 py-2 text-sm font-light text-background hover:opacity-90 transition-opacity h-[var(--input-height)]">
              Subscribe
            </button>
          </div>
        </div>
      </PageShell.Section>

      {/* Footer */}
      <PageShell.Footer columns={2} className="border-border/50 bg-transparent">
        <span className="text-xs tracking-[0.15em] uppercase text-muted-foreground">&copy; 2026 Maison Eclat</span>
        <div className="flex gap-6 justify-end">
          <span className="text-xs text-muted-foreground hover:text-foreground cursor-pointer transition-colors">Privacy</span>
          <span className="text-xs text-muted-foreground hover:text-foreground cursor-pointer transition-colors">Terms</span>
          <span className="text-xs text-muted-foreground hover:text-foreground cursor-pointer transition-colors">Contact</span>
        </div>
      </PageShell.Footer>

      <ThemeConfigPanel defaultConfig={maisonConfig} />
    </PageShell>
  )
}
