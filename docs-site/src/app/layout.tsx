import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './providers'
import { ConditionalSidebar } from '@/components/conditional-sidebar'
import { MainContent } from '@/components/conditional-layout'

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
      <body className={`font-sans antialiased`}>
        <Providers>
          <div className="flex min-h-screen">
            <ConditionalSidebar />
            <MainContent>
              {children}
            </MainContent>
          </div>
        </Providers>
      </body>
    </html>
  )
}

