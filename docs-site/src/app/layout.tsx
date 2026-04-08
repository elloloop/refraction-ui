import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { Sidebar } from '@/components/sidebar'
import { ThemeSwitcher } from '@/components/theme-switcher'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
})

export const metadata: Metadata = {
  title: 'Refraction UI - Component Documentation',
  description: 'Per-component headless UI library for React, Angular, and Astro',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Inline script to apply saved theme before first paint (prevents flash) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var THEMES = ${JSON.stringify(
                    Object.fromEntries(
                      ['refraction','luxe','warm','signal','pulse','mono'].map(k => [k, k])
                    )
                  )};
                  var saved = localStorage.getItem('rfr-theme-preset');
                  // We cannot inline all theme data here, but the ThemeSwitcher
                  // component will apply the full theme on mount. This script
                  // only ensures we do NOT flash dark mode.
                  document.documentElement.classList.remove('dark');
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>
          <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 ml-64">
              {/* Top bar with theme switcher */}
              <div className="sticky top-0 z-30 flex items-center justify-end border-b border-border bg-background/80 backdrop-blur-sm px-8 py-3">
                <ThemeSwitcher />
              </div>
              <div className="mx-auto max-w-4xl px-8 py-12">
                {children}
              </div>
            </main>
          </div>
        </Providers>
      </body>
    </html>
  )
}
