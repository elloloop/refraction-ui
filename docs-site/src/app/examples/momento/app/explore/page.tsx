'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ThemeConfigPanel } from '@/components/theme-config-panel'
import { momentoConfig } from '../../../theme-configs'

const categories = ['For You', 'Travel', 'Architecture', 'Food', 'Art', 'Nature', 'Fashion', 'Music']

/* Masonry-style grid: alternate between small (1x1) and large (2x2) items */
const gridItems = [
  { color: 'from-rose-400 to-pink-600', span: 'col-span-1 row-span-1' },
  { color: 'from-blue-400 to-indigo-600', span: 'col-span-1 row-span-1' },
  { color: 'from-amber-400 to-orange-600', span: 'col-span-1 row-span-2' },
  { color: 'from-emerald-400 to-teal-600', span: 'col-span-1 row-span-1' },
  { color: 'from-violet-400 to-purple-600', span: 'col-span-1 row-span-1' },
  { color: 'from-cyan-400 to-blue-500', span: 'col-span-1 row-span-1' },
  { color: 'from-fuchsia-400 to-pink-600', span: 'col-span-1 row-span-2' },
  { color: 'from-lime-400 to-emerald-500', span: 'col-span-1 row-span-1' },
  { color: 'from-red-400 to-rose-600', span: 'col-span-1 row-span-1' },
  { color: 'from-sky-400 to-cyan-600', span: 'col-span-1 row-span-1' },
  { color: 'from-yellow-400 to-amber-500', span: 'col-span-1 row-span-1' },
  { color: 'from-indigo-400 to-violet-600', span: 'col-span-1 row-span-2' },
  { color: 'from-teal-400 to-green-500', span: 'col-span-1 row-span-1' },
  { color: 'from-orange-500 to-red-600', span: 'col-span-1 row-span-1' },
  { color: 'from-pink-400 to-fuchsia-600', span: 'col-span-1 row-span-1' },
  { color: 'from-green-400 to-emerald-600', span: 'col-span-1 row-span-1' },
  { color: 'from-purple-400 to-indigo-500', span: 'col-span-1 row-span-2' },
  { color: 'from-orange-400 to-amber-600', span: 'col-span-1 row-span-1' },
  { color: 'from-blue-500 to-sky-600', span: 'col-span-1 row-span-1' },
  { color: 'from-rose-500 to-red-600', span: 'col-span-1 row-span-1' },
  { color: 'from-emerald-500 to-teal-700', span: 'col-span-1 row-span-1' },
  { color: 'from-violet-500 to-purple-700', span: 'col-span-1 row-span-1' },
  { color: 'from-amber-500 to-yellow-600', span: 'col-span-1 row-span-2' },
  { color: 'from-cyan-500 to-blue-700', span: 'col-span-1 row-span-1' },
]

const instaTheme = `:root {
  --primary: 340 82% 52%;
  --primary-foreground: 0 0% 100%;
  --avatar-radius: 9999px;
  --button-radius: 0.5rem;
  --card-radius: 0.5rem;
}`

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('For You')

  return (
    <div
      className="min-h-screen bg-background text-foreground pb-20"
      style={{
        '--primary': '340 82% 52%',
        '--primary-foreground': '0 0% 100%',
        '--accent': '340 50% 95%',
        '--accent-foreground': '340 82% 42%',
      } as React.CSSProperties}
    >
      {/* Top nav */}
      <nav className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="mx-auto max-w-xl px-4 py-3">
          {/* Search bar */}
          <div className="flex items-center gap-2 rounded-[var(--input-radius)] bg-muted px-3 py-2.5">
            <svg className="h-4 w-4 text-muted-foreground shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search"
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
            />
          </div>

          {/* Category pills */}
          <div className="flex gap-2 mt-3 overflow-x-auto no-scrollbar pb-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`shrink-0 rounded-[var(--badge-radius)] px-3 py-1.5 text-xs font-medium transition-colors ${
                  cat === activeCategory
                    ? 'bg-foreground text-background'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Masonry grid */}
      <div className="mx-auto max-w-xl px-1 pt-1">
        <div className="grid grid-cols-3 gap-0.5 auto-rows-[120px] sm:auto-rows-[150px]">
          {gridItems.map((item, idx) => (
            <div
              key={idx}
              className={`${item.span} bg-gradient-to-br ${item.color} flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity relative group`}
            >
              <svg className="h-6 w-6 text-white/20" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
              </svg>
              {/* Reel indicator on some items */}
              {item.span.includes('row-span-2') && (
                <div className="absolute top-2 right-2">
                  <svg className="h-4 w-4 text-white/70" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
                  </svg>
                </div>
              )}
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="flex items-center gap-4 text-white text-sm font-semibold">
                  <span className="flex items-center gap-1">
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
                    </svg>
                    {Math.floor(Math.random() * 8000 + 500)}
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                      <path fillRule="evenodd" d="M4.804 21.644A6.707 6.707 0 0 0 6 21.75a6.721 6.721 0 0 0 3.583-1.029c.774.182 1.584.279 2.417.279 5.322 0 9.75-3.97 9.75-9 0-5.03-4.428-9-9.75-9s-9.75 3.97-9.75 9c0 2.409 1.025 4.587 2.674 6.192.232.226.277.428.254.543a3.73 3.73 0 0 1-.814 1.686.75.75 0 0 0 .44 1.223ZM8.25 10.875a1.125 1.125 0 1 0 0 2.25 1.125 1.125 0 0 0 0-2.25ZM10.875 12a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0Zm4.875-1.125a1.125 1.125 0 1 0 0 2.25 1.125 1.125 0 0 0 0-2.25Z" clipRule="evenodd" />
                    </svg>
                    {Math.floor(Math.random() * 300 + 10)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-background/80 backdrop-blur-sm z-40">
        <div className="mx-auto max-w-xl flex items-center justify-around py-2">
          <Link href="/examples/momento/app" className="p-2 text-muted-foreground">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
          </Link>
          <Link href="/examples/momento/app/explore" className="p-2 text-foreground">
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
              <path fillRule="evenodd" d="M10.5 3.75a6.75 6.75 0 1 0 0 13.5 6.75 6.75 0 0 0 0-13.5ZM2.25 10.5a8.25 8.25 0 1 1 14.59 5.28l4.69 4.69a.75.75 0 1 1-1.06 1.06l-4.69-4.69A8.25 8.25 0 0 1 2.25 10.5Z" clipRule="evenodd" />
            </svg>
          </Link>
          <button className="p-2 text-muted-foreground">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          </button>
          <button className="p-2 text-muted-foreground">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
            </svg>
          </button>
          <Link href="/examples/momento/app/profile" className="p-2">
            <div className="h-6 w-6 rounded-full bg-muted border border-border flex items-center justify-center text-[8px] font-bold text-muted-foreground">
              AJ
            </div>
          </Link>
        </div>
      </div>

      <ThemeConfigPanel defaultConfig={momentoConfig} />
    </div>
  )
}
