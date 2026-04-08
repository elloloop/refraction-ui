import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { Sidebar } from '@/components/sidebar'
import { ThemeSwitcher } from '@/components/theme-switcher'
import { ModeToggle } from '@/components/mode-toggle'

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
                  var mode = localStorage.getItem('rfr-theme');
                  if (mode === 'dark' || (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
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
              <div className="sticky top-0 z-30 flex items-center justify-end gap-3 border-b border-border bg-background/80 backdrop-blur-sm px-8 py-3">
                <ModeToggle />
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
