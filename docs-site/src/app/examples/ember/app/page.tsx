'use client'

import { useState } from 'react'
import Link from 'next/link'
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
    <div className="">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-8 py-4 border-b border-border bg-background/80 backdrop-blur-sm">
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
      </nav>

      {/* Header */}
      <div className="px-8 py-10 text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground" style={{ letterSpacing: 'var(--heading-letter-spacing)' }}>
          Our Menu
        </h1>
        <p className="text-muted-foreground mt-2">Seasonal ingredients, open-flame cooking</p>
      </div>

      {/* Category Tabs */}
      <div className="px-8 border-b border-border">
        <div className="max-w-3xl mx-auto flex gap-1">
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
      </div>

      {/* Menu Items */}
      <div className="max-w-3xl mx-auto px-8 py-8">
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
      </div>

      {/* Wine List */}
      <div className="px-8 py-[var(--section-gap)] bg-muted/20">
        <div className="max-w-3xl mx-auto space-y-6">
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
      </div>

      {/* Legend */}
      <div className="max-w-3xl mx-auto px-8 py-8">
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
      </div>

      {/* Footer */}
      <footer className="border-t border-border px-8 py-8">
        <div className="max-w-4xl mx-auto flex items-center justify-between text-sm text-muted-foreground">
          <span>&copy; 2026 Ember &amp; Oak</span>
          <Link href="/examples/ember/app/reservation" className="text-primary hover:underline">Reserve a Table</Link>
        </div>
      </footer>
      <ThemeConfigPanel defaultConfig={emberConfig} />
    </div>
  )
}
