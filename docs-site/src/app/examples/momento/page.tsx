'use client'

import Link from 'next/link'
import { PageShell } from '@refraction-ui/react-app-shell'
import { ThemeConfigPanel } from '@/components/theme-config-panel'
import { momentoConfig } from '../theme-configs'
import { features } from './config'
import { MomentoLogo } from '@/components/logos';


export default function MomentoLandingPage() {
  return (
    <PageShell config={{ navSticky: true, maxWidth: '72rem' }}>
      {/* Nav */}
      <PageShell.Nav className="justify-between bg-background/80 backdrop-blur-sm">
        <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-primary via-primary/80 to-accent bg-clip-text text-transparent"><MomentoLogo className="h-6 w-auto" /></span>
        <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          <span className="hover:text-foreground cursor-pointer transition-colors">Features</span>
          <span className="hover:text-foreground cursor-pointer transition-colors">Safety</span>
          <span className="hover:text-foreground cursor-pointer transition-colors">Creators</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/examples/momento/app" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Log in
          </Link>
          <Link
            href="/examples/momento/app"
            className="rounded-[var(--button-radius)] bg-gradient-to-r from-primary via-primary/80 to-accent px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
          >
            Sign Up
          </Link>
        </div>
      </PageShell.Nav>

      {/* Hero */}
      <PageShell.Section maxWidth="6xl" className="pt-20 pb-24">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          {/* Phone mockup */}
          <div className="lg:w-1/2 flex justify-center">
            <div className="relative w-72">
              <div className="rounded-[2rem] border-4 border-foreground/10 bg-card shadow-2xl overflow-hidden">
                <div className="h-[480px] bg-gradient-to-br from-primary via-primary/80 to-accent flex flex-col items-center justify-center p-6 text-primary-foreground">
                  <div className="w-20 h-20 rounded-full border-4 border-white/30 mb-4 flex items-center justify-center">
                    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
                    </svg>
                  </div>
                  <div className="space-y-2 text-center">
                    <div className="h-3 bg-white/30 rounded-full w-32" />
                    <div className="h-3 bg-white/20 rounded-full w-24 mx-auto" />
                  </div>
                  <div className="mt-8 grid grid-cols-3 gap-2 w-full">
                    {[
                      '/assets/people/ea/ea-4-portrait.jpg',
                      '/assets/scenes/scene-cafe.jpg',
                      '/assets/people/me/me-3-portrait.jpg',
                      '/assets/animals/dogs/dog-4-portrait.jpg',
                      '/assets/people/am/am-4-portrait.jpg',
                      '/assets/scenes/scene-park.jpg'
                    ].map((src, i) => (
                      <div key={i} className="aspect-square rounded-lg bg-white/20 overflow-hidden">
                        <img src={src} alt="Gallery item" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Text */}
          <div className="lg:w-1/2 text-center lg:text-left">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-foreground leading-tight">
              Share your
              <span className="block bg-gradient-to-r from-primary via-primary/80 to-accent bg-clip-text text-transparent">
                world
              </span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-md leading-relaxed">
              Capture, edit, and share photos and videos with the people who matter most. Join a growing community of creators and storytellers.
            </p>
            <div className="mt-8 flex items-center gap-4 flex-wrap justify-center lg:justify-start">
              {/* App Store badge */}
              <div className="flex items-center gap-2 rounded-[var(--button-radius)] bg-foreground px-5 py-3 text-background cursor-pointer hover:opacity-90 transition-opacity">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 22 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.1 22C7.79 22.05 6.8 20.68 5.96 19.47C4.25 16.56 2.93 11.3 4.7 7.72C5.57 5.94 7.36 4.86 9.28 4.84C10.56 4.81 11.78 5.72 12.57 5.72C13.36 5.72 14.85 4.62 16.4 4.8C17.04 4.83 18.89 5.06 20.07 6.82C19.96 6.89 17.62 8.28 17.65 11.07C17.68 14.37 20.55 15.47 20.58 15.48C20.55 15.55 20.12 17.12 18.71 19.5ZM13 3.5C13.73 2.67 14.94 2.04 15.94 2C16.07 3.17 15.6 4.35 14.9 5.19C14.21 6.04 13.07 6.7 11.95 6.61C11.8 5.46 12.36 4.26 13 3.5Z" />
                </svg>
                <div>
                  <p className="text-[10px] leading-none">Download on the</p>
                  <p className="text-sm font-semibold leading-tight">App Store</p>
                </div>
              </div>
              {/* Play Store badge */}
              <div className="flex items-center gap-2 rounded-[var(--button-radius)] bg-foreground px-5 py-3 text-background cursor-pointer hover:opacity-90 transition-opacity">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.199l2.302 2.302a1 1 0 0 1 0 1.38l-2.302 2.303L15.4 13.193l2.298-3.685zM5.864 2.658L16.8 8.99l-2.302 2.302L5.864 2.658z" />
                </svg>
                <div>
                  <p className="text-[10px] leading-none">Get it on</p>
                  <p className="text-sm font-semibold leading-tight">Google Play</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageShell.Section>

      {/* Features */}
      <PageShell.Section fullWidth background="muted" className="py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-foreground mb-4">Express yourself</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-xl mx-auto">
            From stories to clips, Momento gives you all the creative tools to share your world.
          </p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-[var(--card-radius)] border border-border bg-card p-6 hover:shadow-md transition-shadow text-center"
              >
                <div className="mb-4 mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  {f.icon}
                </div>
                <h3 className="text-base font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </PageShell.Section>

      {/* Stats */}
      <PageShell.Section maxWidth="6xl" className="py-20">
        <div className="grid gap-8 sm:grid-cols-3 text-center">
          <div>
            <p className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">10M+</p>
            <p className="text-sm text-muted-foreground mt-2">Monthly active users</p>
          </div>
          <div>
            <p className="text-4xl font-bold bg-gradient-to-r from-primary/80 to-accent bg-clip-text text-transparent">5M+</p>
            <p className="text-sm text-muted-foreground mt-2">Photos shared daily</p>
          </div>
          <div>
            <p className="text-4xl font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">20M+</p>
            <p className="text-sm text-muted-foreground mt-2">Stories viewed daily</p>
          </div>
        </div>
      </PageShell.Section>

      {/* Footer */}
      <PageShell.Footer columns={4}>
        <div>
          <h4 className="font-semibold text-foreground mb-3">Product</h4>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p className="hover:text-foreground cursor-pointer transition-colors">Features</p>
            <p className="hover:text-foreground cursor-pointer transition-colors">Reels</p>
            <p className="hover:text-foreground cursor-pointer transition-colors">Stories</p>
            <p className="hover:text-foreground cursor-pointer transition-colors">Clips</p>
          </div>
        </div>
        <div>
          <h4 className="font-semibold text-foreground mb-3">Community</h4>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p className="hover:text-foreground cursor-pointer transition-colors">Creators</p>
            <p className="hover:text-foreground cursor-pointer transition-colors">Developers</p>
            <p className="hover:text-foreground cursor-pointer transition-colors">Guidelines</p>
          </div>
        </div>
        <div>
          <h4 className="font-semibold text-foreground mb-3">Support</h4>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p className="hover:text-foreground cursor-pointer transition-colors">Help Center</p>
            <p className="hover:text-foreground cursor-pointer transition-colors">Safety</p>
            <p className="hover:text-foreground cursor-pointer transition-colors">Privacy</p>
          </div>
        </div>
        <div>
          <h4 className="font-semibold text-foreground mb-3">Company</h4>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p className="hover:text-foreground cursor-pointer transition-colors">About</p>
            <p className="hover:text-foreground cursor-pointer transition-colors">Blog</p>
            <p className="hover:text-foreground cursor-pointer transition-colors">Careers</p>
            <Link href="/examples" className="hover:text-foreground transition-colors block">All Examples</Link>
          </div>
        </div>
      </PageShell.Footer>

      <ThemeConfigPanel defaultConfig={momentoConfig} />
    </PageShell>
  )
}
