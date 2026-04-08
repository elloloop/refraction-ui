'use client'

import { useState } from 'react'
import Link from 'next/link'
import { PageShell } from '@refraction-ui/react-app-shell'
import { ThemeConfigPanel } from '@/components/theme-config-panel'
import { emberConfig } from '../../theme-configs'
import { menu, wines, categories, badgeColors } from '../config'

type Category = 'starters' | 'mains' | 'desserts' | 'drinks'

interface MenuItem {
  name: string
  description: string
  price: string
  badges?: string[]
}

export default function RestaurantMenuPage() {
  const [activeCategory, setActiveCategory] = useState<Category>('starters')

  return (
    <PageShell config={{ navSticky: true }}>
      {/* Navigation */}
      <PageShell.Nav className="justify-between bg-background/80 backdrop-blur-sm">
        <Link href="/examples/ember" className="text-lg font-semibold text-foreground tracking-tight">
          Ember &amp; Oak
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/examples/ember" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Home</Link>
          <span className="text-sm text-foreground font-medium">Menu</span>
          <Link
            href="/examples/ember/app/reservation"
            className="rounded-[var(--button-radius)] bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
          >
            Reserve
          </Link>
        </div>
      </PageShell.Nav>

      {/* Header */}
      <PageShell.Section maxWidth="3xl" className="py-10 text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground" style={{ letterSpacing: 'var(--heading-letter-spacing)' }}>
          Our Menu
        </h1>
        <p className="text-muted-foreground mt-2">Seasonal ingredients, open-flame cooking</p>
      </PageShell.Section>

      {/* Category Tabs */}
      <PageShell.Section maxWidth="3xl" className="py-0 border-b border-border">
        <div className="flex gap-1">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeCategory === cat.key
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </PageShell.Section>

      {/* Menu Items */}
      <PageShell.Section maxWidth="3xl">
        <div className="space-y-1">
          {menu[activeCategory].map((item, i) => (
            <div key={item.name} className={`flex items-start justify-between py-5 ${i < menu[activeCategory].length - 1 ? 'border-b border-border' : ''}`}>
              <div className="space-y-1.5 pr-6">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-foreground">{item.name}</h3>
                  {item.badges?.map((badge) => (
                    <span
                      key={badge}
                      className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium ring-1 ring-inset ${badgeColors[badge] || 'bg-muted text-muted-foreground ring-border'}`}
                    >
                      {badge}
                    </span>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
              <span className="text-foreground font-medium whitespace-nowrap">{item.price}</span>
            </div>
          ))}
        </div>
      </PageShell.Section>

      {/* Wine List */}
      <PageShell.Section maxWidth="3xl" background="muted" className="py-[var(--section-gap)]">
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground" style={{ letterSpacing: 'var(--heading-letter-spacing)' }}>
              Wine Selection
            </h2>
            <p className="text-sm text-muted-foreground mt-1">Curated by our sommelier</p>
          </div>
          <div className="rounded-[var(--card-radius)] border border-border bg-card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Wine</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Region</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Type</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Bottle</th>
                </tr>
              </thead>
              <tbody>
                {wines.map((wine, i) => (
                  <tr key={wine.name} className={i < wines.length - 1 ? 'border-b border-border' : ''}>
                    <td className="px-4 py-3 text-sm font-medium text-foreground">{wine.name}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{wine.region}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{wine.type}</td>
                    <td className="px-4 py-3 text-sm font-medium text-foreground text-right">{wine.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </PageShell.Section>

      {/* Legend */}
      <PageShell.Section maxWidth="3xl">
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium ring-1 ring-inset ${badgeColors.V}`}>V</span>
            Vegetarian
          </span>
          <span className="flex items-center gap-1">
            <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium ring-1 ring-inset ${badgeColors.GF}`}>GF</span>
            Gluten Free
          </span>
          <span className="flex items-center gap-1">
            <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium ring-1 ring-inset ${badgeColors.DF}`}>DF</span>
            Dairy Free
          </span>
        </div>
      </PageShell.Section>

      {/* Footer */}
      <PageShell.Footer columns={2}>
        <span className="text-sm text-muted-foreground">&copy; 2026 Ember &amp; Oak</span>
        <div className="flex justify-end">
          <Link href="/examples/ember/app/reservation" className="text-sm text-primary hover:underline">Reserve a Table</Link>
        </div>
      </PageShell.Footer>

      <ThemeConfigPanel defaultConfig={emberConfig} />
    </PageShell>
  )
}
