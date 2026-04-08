'use client'

import Link from 'next/link'
import { ThemeConfigPanel } from '@/components/theme-config-panel'
import { grandviewConfig } from '../theme-configs'
import { rooms, testimonials, socialLinks } from './config'

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className={`h-4 w-4 ${i < count ? 'text-warning' : 'text-muted'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

export default function GrandviewLandingPage() {
  return (
    <div className="">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-8 py-4 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3H21m-3.75 3H21" />
          </svg>
          <span className="text-lg font-semibold text-foreground tracking-tight">The Grandview</span>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/examples/grandview/app" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Rooms</Link>
          <Link href="#about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">About</Link>
          <Link href="#testimonials" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Reviews</Link>
          <Link href="/examples/grandview/app/booking" className="rounded-[var(--button-radius)] bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity">
            Book Now
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative">
        <div className="h-[480px] bg-gradient-to-br from-primary/20 via-accent to-primary/10 flex items-center justify-center">
          <div className="absolute inset-0 bg-foreground/5" />
          <div className="relative text-center space-y-6 px-8">
            <h1 className="text-5xl font-bold tracking-tight text-foreground" style={{ letterSpacing: 'var(--heading-letter-spacing)' }}>
              Experience Luxury
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Where timeless elegance meets modern comfort. Discover a sanctuary of refined hospitality on the shores of the Pacific.
            </p>
            <Link
              href="/examples/grandview/app/booking"
              className="inline-flex items-center gap-2 rounded-[var(--button-radius)] bg-primary px-6 py-3 text-base font-medium text-primary-foreground shadow-[var(--button-shadow)] hover:opacity-90 transition-opacity"
            >
              Book Your Stay
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="px-8 py-[var(--section-gap)]">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-semibold tracking-tight text-foreground" style={{ letterSpacing: 'var(--heading-letter-spacing)' }}>
              About Our Hotel
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Nestled along the pristine coastline, The Grandview has been a beacon of timeless hospitality since 1924. Our commitment to extraordinary service, world-class dining, and unparalleled comfort has earned us recognition among the finest hotels worldwide.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Each of our 200 rooms and suites has been thoughtfully designed to offer a perfect blend of classic elegance and contemporary sophistication, ensuring every guest experience is nothing short of exceptional.
            </p>
          </div>
          <div className="h-72 rounded-[var(--card-radius)] bg-gradient-to-br from-muted to-accent flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <svg className="h-12 w-12 mx-auto mb-2 opacity-50" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
              </svg>
              <span className="text-sm">Hotel Exterior</span>
            </div>
          </div>
        </div>
      </section>

      {/* Room Types */}
      <section className="px-8 py-[var(--section-gap)] bg-muted/30">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-semibold tracking-tight text-foreground" style={{ letterSpacing: 'var(--heading-letter-spacing)' }}>
              Our Rooms
            </h2>
            <p className="text-muted-foreground">Choose from our selection of beautifully appointed accommodations.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {rooms.map((room) => (
              <div key={room.name} className="rounded-[var(--card-radius)] border border-border bg-card shadow-[var(--card-shadow)] overflow-hidden">
                <div className="h-48 bg-gradient-to-br from-accent to-muted flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <svg className="h-10 w-10 mx-auto mb-1 opacity-50" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
                    </svg>
                    <span className="text-xs">{room.image}</span>
                  </div>
                </div>
                <div className="p-[var(--card-padding)] space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-foreground">{room.name}</h3>
                    <span className="text-primary font-semibold">${room.price}<span className="text-xs text-muted-foreground font-normal">/night</span></span>
                  </div>
                  <ul className="space-y-1.5">
                    {room.amenities.map((amenity) => (
                      <li key={amenity} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <svg className="h-3.5 w-3.5 text-success flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                        </svg>
                        {amenity}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/examples/grandview/app/booking"
                    className="block text-center rounded-[var(--button-radius)] bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
                  >
                    Book Now
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center">
            <Link href="/examples/grandview/app" className="text-sm text-primary hover:underline">
              View all rooms &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="px-8 py-[var(--section-gap)]">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-semibold tracking-tight text-foreground" style={{ letterSpacing: 'var(--heading-letter-spacing)' }}>
              Guest Reviews
            </h2>
            <p className="text-muted-foreground">What our guests have to say about their stay.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="rounded-[var(--card-radius)] border border-border bg-card p-[var(--card-padding)] shadow-[var(--card-shadow)] space-y-3">
                <StarRating count={t.rating} />
                <p className="text-sm text-muted-foreground leading-relaxed">&ldquo;{t.text}&rdquo;</p>
                <div className="pt-2 border-t border-border">
                  <p className="text-sm font-medium text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30 px-8 py-12">
        <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8">
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground">Contact</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>+1 (555) 234-5678</p>
              <p>reservations@thegrandview.com</p>
            </div>
          </div>
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground">Address</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>1200 Ocean Boulevard</p>
              <p>Pacific Heights, CA 94115</p>
              <p>United States</p>
            </div>
          </div>
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground">Follow Us</h3>
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <span key={social} className="text-sm text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
                  {social}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="max-w-4xl mx-auto mt-8 pt-6 border-t border-border text-center text-xs text-muted-foreground">
          &copy; 2026 The Grandview. All rights reserved.
        </div>
      </footer>

      <ThemeConfigPanel defaultConfig={grandviewConfig} />
    </div>
  )
}
