'use client'

import * as React from 'react'
import { LinkPreview, type LinkPreviewImage } from '@refraction-ui/react-link-preview'

interface LinkPreviewExamplesProps {
  section: 'full' | 'compact' | 'dismissible' | 'fallbacks' | 'message'
}

const OG_WIDTH = 1200
const OG_HEIGHT = 630

/**
 * Self-contained Open Graph-style artwork so the examples load offline. The
 * colours are demo *content* (like a photo), not component theming.
 */
function demoImage(label: string, from: string, to: string): LinkPreviewImage {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${OG_WIDTH} ${OG_HEIGHT}"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#g)"/><text x="80" y="${OG_HEIGHT - 90}" font-family="system-ui, sans-serif" font-size="88" font-weight="700" fill="white">${label}</text></svg>`
  return {
    src: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`,
    width: OG_WIDTH,
    height: OG_HEIGHT,
  }
}

function demoIcon(letter: string, color: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="${color}"/><text x="16" y="22" text-anchor="middle" font-family="system-ui, sans-serif" font-size="18" font-weight="700" fill="white">${letter}</text></svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

const release = {
  url: 'https://www.example.dev/blog/v2-release',
  siteName: 'Example Dev Blog',
  siteIcon: demoIcon('E', '#4f46e5'),
  title: 'Version 2.0: faster builds and a new plugin API',
  description:
    'Incremental compilation cuts cold builds by 60%, plugins get a typed lifecycle, and the CLI learns to explain its own errors.',
  image: demoImage('v2.0 is here', '#4f46e5', '#0ea5e9'),
}

const article = {
  url: 'https://news.example.org/2026/10/standups',
  siteName: 'Example News',
  siteIcon: demoIcon('N', '#b91c1c'),
  title: 'Why the best teams are quietly dropping daily stand-ups',
  description: 'Async check-ins, fewer meetings and what the data says.',
  image: demoImage('Async wins', '#b91c1c', '#f59e0b'),
}

const frame = 'rounded-xl border border-border bg-card p-6 sm:p-8'

export function LinkPreviewExamples({ section }: LinkPreviewExamplesProps) {
  if (section === 'full') {
    return (
      <div className={frame}>
        <LinkPreview {...release} />
      </div>
    )
  }

  if (section === 'compact') {
    return (
      <div className={`${frame} space-y-3`}>
        <LinkPreview {...release} variant="compact" />
        <LinkPreview {...article} variant="compact" />
      </div>
    )
  }

  if (section === 'dismissible') return <DismissibleExample />

  if (section === 'fallbacks') {
    return (
      <div className={`${frame} space-y-3`}>
        {/* No image: text only. */}
        <LinkPreview
          url="https://docs.example.com/guides/auth"
          siteName="Example Docs"
          title="Authentication guide"
          description="Sessions, tokens and refresh flows."
        />
        {/* No metadata at all: the host stands in for the title. */}
        <LinkPreview url="https://example.com/some/page" variant="compact" />
        {/* Rejected: not http(s), so nothing renders. */}
        <LinkPreview url="javascript:alert(1)" title="You will not see this" />
      </div>
    )
  }

  if (section === 'message') return <MessageExample />

  return null
}

function DismissibleExample() {
  const [shown, setShown] = React.useState({ full: true, compact: true })
  const allHidden = !shown.full && !shown.compact
  return (
    <div className={`${frame} space-y-3`}>
      {shown.full ? (
        <LinkPreview {...release} onDismiss={() => setShown((s) => ({ ...s, full: false }))} />
      ) : null}
      {shown.compact ? (
        <LinkPreview
          {...article}
          variant="compact"
          onDismiss={() => setShown((s) => ({ ...s, compact: false }))}
        />
      ) : null}
      {allHidden ? (
        <button
          type="button"
          className="rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          onClick={() => setShown({ full: true, compact: true })}
        >
          Restore previews
        </button>
      ) : null}
    </div>
  )
}

function MessageExample() {
  const [shown, setShown] = React.useState(true)
  const messageLinkRef = React.useRef<HTMLAnchorElement>(null)
  // The dismiss button unmounts with the preview, so hand focus to the
  // message's own link instead of letting it fall back to <body>.
  const dismiss = () => {
    setShown(false)
    messageLinkRef.current?.focus()
  }
  return (
    <div className={frame}>
      <div className="flex max-w-lg gap-3">
        <div
          aria-hidden="true"
          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground"
        >
          AK
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <p className="text-sm text-foreground">
            <span className="font-semibold">Ana Kim</span>{' '}
            <span className="text-xs text-muted-foreground">10:42</span>
          </p>
          <p className="text-sm text-foreground">
            The release post is up 🎉{' '}
            <a
              ref={messageLinkRef}
              href={release.url}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="text-primary underline underline-offset-2"
            >
              {release.url}
            </a>
          </p>
          {shown ? (
            <LinkPreview {...release} onDismiss={dismiss} dismissLabel="Remove preview from message" />
          ) : null}
        </div>
      </div>
    </div>
  )
}
