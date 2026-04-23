'use client'

import Link from 'next/link'
import { useState } from 'react'
import { PageShell } from '@refraction-ui/react-app-shell'
import { ThemeConfigPanel } from '@/components/theme-config-panel'
import { learnhubConfig } from '../../theme-configs'
import { allCourses, categories } from '../config'
import { LearnhubLogo } from '@/components/logos';


export default function CourseCatalog() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')

  const filtered = allCourses.filter((c) => {
    const matchCategory = category === 'All' || c.category === category
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) || c.instructor.toLowerCase().includes(search.toLowerCase())
    return matchCategory && matchSearch
  })

  return (
    <PageShell config={{ navSticky: true, maxWidth: '72rem' }}>
      {/* Nav */}
      <PageShell.Nav className="justify-between bg-background/80 backdrop-blur-sm">
        <Link href="/examples/learnhub" className="text-xl font-bold text-primary"><LearnhubLogo className="h-6 w-auto" /></Link>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Welcome back, Student</span>
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">SJ</div>
        </div>
      </PageShell.Nav>

      <PageShell.Section maxWidth="6xl">
        <div className="space-y-8">
          <div>
            <h1 className="text-2xl font-bold">Course Catalog</h1>
            <p className="mt-1 text-muted-foreground">Find your next learning adventure.</p>
          </div>

          {/* Search + Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
              <input
                type="text"
                placeholder="Search courses or instructors..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-[var(--input-radius)] border border-border bg-background pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    category === cat ? 'bg-primary text-primary-foreground' : 'border border-border hover:bg-muted'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Results count */}
          <p className="text-sm text-muted-foreground">{filtered.length} courses found</p>

          {/* Course grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((course, i) => (
              <Link
                key={i}
                href="/examples/learnhub/app/course"
                className="group rounded-[var(--card-radius)] border border-border bg-card overflow-hidden transition-all hover:shadow-md hover:border-primary/30"
              >
                <div className={`aspect-video bg-gradient-to-br ${course.color} flex items-center justify-center`}>
                  <svg className="h-10 w-10 text-primary/30" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
                  </svg>
                </div>
                <div className="p-4">
                  <span className="inline-block rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground mb-2">{course.category}</span>
                  <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">{course.title}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{course.instructor}</p>
                  <div className="mt-2 flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <svg key={j} className={`h-3 w-3 ${j < Math.floor(course.rating) ? 'text-[hsl(var(--warning))]' : 'text-muted'}`} fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    ))}
                    <span className="text-xs text-muted-foreground ml-1">{course.rating} ({course.students.toLocaleString()})</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-lg font-bold text-primary">{course.price}</span>
                    <span className="rounded-[var(--button-radius)] bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90">
                      Enroll
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </PageShell.Section>

      <ThemeConfigPanel defaultConfig={learnhubConfig} />
    </PageShell>
  )
}
