'use client'

import Link from 'next/link'
import { ThemeConfigPanel } from '@/components/theme-config-panel'
import { emberConfig } from '../theme-configs'

const menuHighlights = [
  {
    name: 'Pan-Seared Scallops',
    description: 'Hokkaido scallops with cauliflower puree, brown butter, and crispy capers',
    price: '$38',
  },
  {
    name: 'Wagyu Beef Tenderloin',
    description: 'A5 wagyu with truffle jus, roasted bone marrow, and seasonal vegetables',
    price: '$72',
  },
  {
    name: 'Wild Mushroom Risotto',
    description: 'Arborio rice with porcini, chanterelle, and shaved Parmigiano-Reggiano',
    price: '$28',
  },
  {
    name: 'Tarte Tatin',
    description: 'Caramelized apple tart with vanilla bean ice cream and salted caramel',
    price: '$18',
  },
]

export default function EmberLandingPage() {
  return (
    <div className="-mx-8 -mt-12">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-8 py-4 border-b border-border bg-background/80 backdrop-blur-sm">
        <span className="text-lg font-semibold text-foreground tracking-tight">Ember &amp; Oak</span>
        <div className="flex items-center gap-6">
          <Link href="/examples/ember/app" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Menu</Link>
          <Link href="#story" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Our Story</Link>
          <Link href="#location" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Visit</Link>
          <Link
            href="/examples/ember/app/reservation"
            className="rounded-[var(--button-radius)] bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
          >
            Reserve a Table
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative">
        <div className="h-[440px] bg-gradient-to-br from-primary/10 via-muted to-accent/20 flex items-center justify-center">
          <div className="absolute inset-0 bg-foreground/3" />
          <div className="relative text-center space-y-6 px-8">
            <p className="text-sm tracking-[0.15em] uppercase text-muted-foreground">Fine Dining</p>
            <h1 className="text-5xl font-bold tracking-tight text-foreground" style={{ letterSpacing: 'var(--heading-letter-spacing)' }}>
              Ember &amp; Oak
            </h1>
            <p className="text-lg text-muted-foreground max-w-md mx-auto">
              Farm to flame. An intimate dining experience rooted in seasonal ingredients and open-flame cooking.
            </p>
            <Link
              href="/examples/ember/app/reservation"
              className="inline-flex items-center gap-2 rounded-[var(--button-radius)] bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
            >
              Reserve a Table
            </Link>
          </div>
        </div>
      </section>

      {/* Menu Highlights */}
      <section className="px-8 py-[var(--section-gap)]">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-semibold tracking-tight text-foreground" style={{ letterSpacing: 'var(--heading-letter-spacing)' }}>
              From Our Kitchen
            </h2>
            <p className="text-muted-foreground">A selection of our most celebrated dishes.</p>
          </div>
          <div className="space-y-1">
            {menuHighlights.map((dish, i) => (
              <div key={dish.name} className={`flex items-start justify-between py-5 ${i < menuHighlights.length - 1 ? 'border-b border-border' : ''}`}>
                <div className="space-y-1 pr-8">
                  <h3 className="font-medium text-foreground">{dish.name}</h3>
                  <p className="text-sm text-muted-foreground">{dish.description}</p>
                </div>
                <span className="text-foreground font-medium whitespace-nowrap">{dish.price}</span>
              </div>
            ))}
          </div>
          <div className="text-center">
            <Link href="/examples/ember/app" className="text-sm text-primary hover:underline">
              View full menu &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section id="story" className="px-8 py-[var(--section-gap)] bg-muted/20">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="h-72 rounded-[var(--card-radius)] bg-gradient-to-br from-accent/50 to-muted flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <svg className="h-12 w-12 mx-auto mb-2 opacity-40" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
              </svg>
              <span className="text-sm">Chef Portrait</span>
            </div>
          </div>
          <div className="space-y-4">
            <h2 className="text-3xl font-semibold tracking-tight text-foreground" style={{ letterSpacing: 'var(--heading-letter-spacing)' }}>
              Our Story
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Founded by Chef Elena Marchand in 2019, Ember &amp; Oak was born from a passion for live-fire cooking and the belief that the best meals come from the simplest, freshest ingredients.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Our open kitchen features a custom-built wood-fired grill and hearth, where every dish is kissed by flame. We source exclusively from local farms and foragers, ensuring each plate tells the story of the season.
            </p>
          </div>
        </div>
      </section>

      {/* Location & Hours */}
      <section id="location" className="px-8 py-[var(--section-gap)]">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12">
          <div className="space-y-6">
            <h2 className="text-3xl font-semibold tracking-tight text-foreground" style={{ letterSpacing: 'var(--heading-letter-spacing)' }}>
              Visit Us
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-foreground mb-1">Address</h3>
                <p className="text-sm text-muted-foreground">742 Evergreen Terrace, Suite 1<br />San Francisco, CA 94110</p>
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-1">Hours</h3>
                <div className="text-sm text-muted-foreground space-y-0.5">
                  <p>Tuesday - Thursday: 5:30 PM - 10:00 PM</p>
                  <p>Friday - Saturday: 5:30 PM - 11:00 PM</p>
                  <p>Sunday: 5:00 PM - 9:00 PM</p>
                  <p>Monday: Closed</p>
                </div>
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-1">Contact</h3>
                <p className="text-sm text-muted-foreground">+1 (415) 555-0182</p>
                <p className="text-sm text-muted-foreground">hello@emberandoak.com</p>
              </div>
            </div>
          </div>
          <div className="h-72 rounded-[var(--card-radius)] bg-muted border border-border flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <svg className="h-12 w-12 mx-auto mb-2 opacity-40" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
              </svg>
              <span className="text-sm">Map Placeholder</span>
            </div>
          </div>
        </div>
      </section>

      {/* Social Grid */}
      <section className="px-8 py-[var(--section-gap)] bg-muted/20">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center">
            <h2 className="text-lg font-medium text-foreground">@emberandoak</h2>
            <p className="text-sm text-muted-foreground mt-1">Follow us on social media</p>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-[var(--radius)] bg-gradient-to-br from-accent to-muted flex items-center justify-center">
                <svg className="h-6 w-6 text-muted-foreground opacity-30" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
                </svg>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-8 py-10">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-sm text-muted-foreground">&copy; 2026 Ember &amp; Oak. All rights reserved.</span>
          <div className="flex gap-6">
            {['Social', 'Facebook', 'Yelp'].map((social) => (
              <span key={social} className="text-sm text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
                {social}
              </span>
            ))}
          </div>
        </div>
      </footer>

      <ThemeConfigPanel defaultConfig={emberConfig} />
    </div>
  )
}
