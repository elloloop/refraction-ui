'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ThemeConfigPanel } from '@/components/theme-config-panel'
import { learnhubConfig } from '../../../theme-configs'
import { curriculum, reviews, courseTabs } from '../../config'

const themeConfig = `:root {
  --primary: 262 52% 47%;
  --background: 0 0% 99%;
  --card: 0 0% 100%;
  --border: 240 6% 92%;
}`

export default function CourseDetail() {
  const [activeTab, setActiveTab] = useState('overview')
  const [expandedSections, setExpandedSections] = useState<number[]>([0])

  const toggleSection = (idx: number) => {
    setExpandedSections((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    )
  }

  const totalLessons = curriculum.reduce((acc, s) => acc + s.lessons.length, 0)
  const totalDuration = curriculum.reduce(
    (acc, s) => acc + s.lessons.reduce((a, l) => a + parseInt(l.duration), 0),
    0
  )

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/examples/learnhub" className="text-xl font-bold text-primary">LearnHub</Link>
          <Link href="/examples/learnhub/app" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Back to Catalog
          </Link>
        </div>
      </nav>

      <div className="mx-auto max-w-6xl px-6 py-8">
        {/* Header */}
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary mb-3">Programming</span>
              <h1 className="text-3xl font-bold tracking-tight">Full-Stack Web Development</h1>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                Master modern web development from front to back. Build production-ready applications with React, Next.js, Node.js, and PostgreSQL.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">JP</div>
                <div>
                  <p className="text-sm font-medium">Jason Park</p>
                  <p className="text-xs text-muted-foreground">Senior Engineer at Vercel</p>
                </div>
              </div>
              <div className="h-8 w-px bg-border" />
              <div className="flex items-center gap-1">
                <svg className="h-4 w-4 text-[hsl(var(--warning))]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                <span className="text-sm font-medium">4.8</span>
                <span className="text-sm text-muted-foreground">(2,340 reviews)</span>
              </div>
              <div className="h-8 w-px bg-border" />
              <span className="text-sm text-muted-foreground">12,400 enrolled</span>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 border-b border-border">
              {courseTabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab.toLowerCase())}
                  className={`px-4 py-2.5 text-sm font-medium transition-colors relative ${
                    activeTab === tab.toLowerCase() ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab}
                  {activeTab === tab.toLowerCase() && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                  )}
                </button>
              ))}
            </div>

            {/* Tab content */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold mb-3">What you will learn</h2>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {[
                      'Build full-stack web applications from scratch',
                      'Master React hooks and modern patterns',
                      'Server-side rendering with Next.js',
                      'REST & GraphQL API design',
                      'Database design with PostgreSQL',
                      'Authentication & authorization',
                      'Testing strategies and CI/CD pipelines',
                      'Deploy to production with confidence',
                    ].map((item) => (
                      <div key={item} className="flex items-start gap-2">
                        <svg className="h-4 w-4 mt-0.5 text-[hsl(var(--success))] flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                        </svg>
                        <span className="text-sm text-muted-foreground">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h2 className="text-lg font-semibold mb-3">Prerequisites</h2>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                      Basic HTML, CSS, and JavaScript knowledge
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                      Familiarity with command line tools
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                      A computer with Node.js installed
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'curriculum' && (
              <div className="space-y-3">
                {curriculum.map((section, sIdx) => (
                  <div key={sIdx} className="rounded-[var(--card-radius)] border border-border bg-card overflow-hidden">
                    <button
                      onClick={() => toggleSection(sIdx)}
                      className="flex w-full items-center justify-between px-5 py-4 text-sm font-semibold hover:bg-muted/30 transition-colors"
                    >
                      <span>{section.section}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground font-normal">{section.lessons.length} lessons</span>
                        <svg className={`h-4 w-4 text-muted-foreground transition-transform ${expandedSections.includes(sIdx) ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                        </svg>
                      </div>
                    </button>
                    {expandedSections.includes(sIdx) && (
                      <div className="border-t border-border">
                        {section.lessons.map((lesson, lIdx) => (
                          <div key={lIdx} className="flex items-center justify-between px-5 py-3 text-sm hover:bg-muted/30 transition-colors border-b border-border last:border-0">
                            <div className="flex items-center gap-3">
                              {lesson.locked ? (
                                <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                                </svg>
                              ) : (
                                <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
                                </svg>
                              )}
                              <span className={lesson.locked ? 'text-muted-foreground' : ''}>{lesson.title}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">{lesson.duration}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-4">
                {reviews.map((review, i) => (
                  <div key={i} className="rounded-[var(--card-radius)] border border-border bg-card p-5">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                          {review.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="text-sm font-medium">{review.name}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{review.date}</span>
                    </div>
                    <div className="flex gap-0.5 mb-2">
                      {Array.from({ length: review.rating }).map((_, j) => (
                        <svg key={j} className="h-3.5 w-3.5 text-[hsl(var(--warning))]" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{review.text}</p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'instructor' && (
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary flex-shrink-0">JP</div>
                  <div>
                    <h2 className="text-lg font-semibold">Jason Park</h2>
                    <p className="text-sm text-muted-foreground">Senior Engineer at Vercel</p>
                    <div className="mt-2 flex gap-4 text-sm text-muted-foreground">
                      <span>12 courses</span>
                      <span>45,000+ students</span>
                      <span>4.8 avg rating</span>
                    </div>
                    <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                      Jason has 10+ years of experience in web development and has worked at several leading technology companies. He is passionate about teaching and has helped thousands of students launch their tech careers.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - enrollment card */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 rounded-[var(--card-radius)] border border-border bg-card p-6 space-y-6">
              <div className="aspect-video rounded-[var(--radius)] bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <svg className="h-12 w-12 text-primary/40" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
                </svg>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold">$79</p>
                <p className="text-xs text-muted-foreground mt-1">Lifetime access</p>
              </div>
              <button className="w-full rounded-[var(--button-radius)] bg-primary px-4 py-3 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity">
                Enroll Now
              </button>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
                  {Math.floor(totalDuration / 60)}h {totalDuration % 60}m total content
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>
                  {totalLessons} lessons
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" /></svg>
                  Certificate of completion
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" /></svg>
                  Mobile & desktop access
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ThemeConfigPanel defaultConfig={learnhubConfig} />
    </div>
  )
}
