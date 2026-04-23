import type { Metadata } from 'next'
import './globals.css'
import { Providers } from '@/components/providers'
import { DocsSidebar } from '@/components/docs-sidebar'
import { DocsLayout } from '@/components/docs-layout'

export const metadata: Metadata = {
  title: 'tvkit — Write HTML/CSS/JS once, ship to every smart TV',
  description:
    'tvkit is a write-once, ship-everywhere toolkit for smart TVs. Web-native runtime, Flutter-style CLI, 85–90% global market coverage.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
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
      <body className="font-sans antialiased">
        <Providers>
          <div className="flex min-h-screen">
            <DocsSidebar />
            <DocsLayout>{children}</DocsLayout>
          </div>
        </Providers>
      </body>
    </html>
  )
}
