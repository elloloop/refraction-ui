'use client'

import { Footer } from '@refraction-ui/react-footer'

interface FooterExamplesProps {
  section: 'basic'
}

export function FooterExamples({ section }: FooterExamplesProps) {
  if (section === 'basic') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <div className="rounded-lg border overflow-hidden">
          <Footer
            copyright="2024 Refraction UI. All rights reserved."
            columns={[
              {
                title: 'Product',
                links: [
                  { label: 'Features', href: '/features' },
                  { label: 'Pricing', href: '/pricing' },
                  { label: 'Changelog', href: '/changelog' },
                ],
              },
              {
                title: 'Resources',
                links: [
                  { label: 'Docs', href: '/docs' },
                  { label: 'Blog', href: '/blog' },
                  { label: 'Support', href: '/support' },
                ],
              },
            ]}
            socialLinks={[
              { label: 'GitHub', href: 'https://github.com' },
              { label: 'Twitter', href: 'https://twitter.com' },
            ]}
          />
        </div>
      </div>
    )
  }

  return null
}
