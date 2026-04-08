'use client'

import Link from 'next/link'
import { PageShell } from '@refraction-ui/react-app-shell'
import { ThemeConfigPanel } from '@/components/theme-config-panel'
import { learnhubConfig } from '../theme-configs'
import { popularCourses, categories } from './config'

export default function EducationLanding() {
  return (
    <PageShell config={{ navSticky: true, maxWidth: '72rem' }}>
      {/* Nav */}
      <PageShell.Nav className="justify-between bg-background/80 backdrop-blur-sm">
        <span className="text-xl font-bold text-primary">LearnHub</span>
        <div className="hidden items-center gap-8 md:flex">
          <a href="#courses" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Courses</a>
          <a href="#categories" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Categories</a>
          <Link href="/examples/learnhub/app" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Browse All</Link>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/examples/learnhub/app" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Sign In
          </Link>
          <Link href="/examples/learnhub/app" className="rounded-[var(--button-radius)] bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity">
            Start Free
          </Link>
        </div>
      </PageShell.Nav>

      {/* Hero */}
      <PageShell.Section maxWidth="6xl" className="py-24 text-center">
        <h1 className="text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
          Learn anything,{' '}
          <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
            anywhere
          </span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground leading-relaxed">
          Access world-class courses from top instructors. Build new skills at your own pace with hands-on projects and expert guidance.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Link href="/examples/learnhub/app" className="rounded-[var(--button-radius)] bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-lg hover:opacity-90 transition-opacity">
            Browse Courses
          </Link>
          <Link href="/examples/learnhub/app" className="rounded-[var(--button-radius)] border border-border px-6 py-3 text-sm font-medium text-foreground hover:bg-muted transition-colors">
            Start Free
          </Link>
        </div>

        {/* Stats */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-12">
          <div className="text-center">
            <p className="text-4xl font-bold text-primary">50K+</p>
            <p className="mt-1 text-sm text-muted-foreground">Students</p>
          </div>
          <div className="h-10 w-px bg-border" />
          <div className="text-center">
            <p className="text-4xl font-bold text-primary">200+</p>
            <p className="mt-1 text-sm text-muted-foreground">Courses</p>
          </div>
          <div className="h-10 w-px bg-border" />
          <div className="text-center">
            <p className="text-4xl font-bold text-primary">50+</p>
            <p className="mt-1 text-sm text-muted-foreground">Instructors</p>
          </div>
        </div>
      </PageShell.Section>

      {/* Categories */}
      <PageShell.Section fullWidth background="muted" className="py-12">
        <div id="categories" className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-3">
            {categories.map((cat) => (
              <Link
                key={cat}
                href="/examples/learnhub/app"
                className="rounded-full border border-border bg-card px-5 py-2 text-sm font-medium text-muted-foreground hover:border-primary/30 hover:text-primary transition-colors"
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>
      </PageShell.Section>

      {/* Popular Courses */}
      <PageShell.Section maxWidth="6xl" className="py-24">
        <div id="courses">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Popular Courses</h2>
              <p className="mt-2 text-muted-foreground">Trending courses our students love.</p>
            </div>
            <Link href="/examples/learnhub/app" className="text-sm font-medium text-primary hover:underline">
              View All Courses
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {popularCourses.map((course) => (
              <Link
                key={course.title}
                href="/examples/learnhub/app/course"
                className="group rounded-[var(--card-radius)] border border-border bg-card overflow-hidden transition-all hover:shadow-md hover:border-primary/30"
              >
                <div className={`aspect-video ${course.thumb} flex items-center justify-center`}>
                  <svg className="h-10 w-10 text-primary/30" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
                  </svg>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-sm group-hover:text-primary transition-colors line-clamp-2">{course.title}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{course.instructor}</p>
                  <div className="mt-2 flex items-center gap-1">
                    <svg className="h-3.5 w-3.5 text-[hsl(var(--warning))]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                    <span className="text-xs font-medium">{course.rating}</span>
                    <span className="text-xs text-muted-foreground">({course.students.toLocaleString()} students)</span>
                  </div>
                  <p className="mt-3 text-lg font-bold text-primary">{course.price}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </PageShell.Section>

      {/* CTA */}
      <PageShell.Section fullWidth className="py-24 bg-primary/5">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-3xl font-bold tracking-tight">Start learning today</h2>
          <p className="mt-4 text-muted-foreground">Join thousands of learners already building their future skills.</p>
          <Link href="/examples/learnhub/app" className="mt-8 inline-block rounded-[var(--button-radius)] bg-primary px-8 py-3 text-sm font-medium text-primary-foreground shadow-lg hover:opacity-90 transition-opacity">
            Get Started Free
          </Link>
        </div>
      </PageShell.Section>

      {/* Footer */}
      <PageShell.Footer columns={1}>
        <div className="text-center">
          <span className="text-sm text-muted-foreground">&copy; 2026 LearnHub. All rights reserved.</span>
        </div>
      </PageShell.Footer>

      <ThemeConfigPanel defaultConfig={learnhubConfig} />
    </PageShell>
  )
}
