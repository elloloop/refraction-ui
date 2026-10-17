'use client'

import * as React from 'react'
import { SandboxFrame, type SandboxFrameStatus } from '@refraction-ui/react-sandbox-frame'

interface SandboxFrameExamplesProps {
  section: 'basic' | 'auto-height' | 'hostile' | 'states'
}

const NEWSLETTER_HTML = `
<h2>Release notes — week 41</h2>
<p>Hi team, here is what shipped this week.</p>
<ul>
  <li><strong>Search</strong> now ranks recent threads first.</li>
  <li><strong>Calls</strong> recover from network changes without dropping.</li>
  <li><strong>Files</strong> preview PDFs inline.</li>
</ul>
<hr>
<p style="font-style: italic">Styled with the host's theme tokens: this text, the links and the rule follow light and dark mode.</p>
<p><a href="https://example.com/changelog">Read the full changelog</a> (links are inert: no popups are allowed).</p>
<h3>Known issues</h3>
<p>Some long messages need a refresh after editing. A fix is in review.</p>
<p>Older desktop builds show a blank sidebar on first launch; restarting resolves it.</p>
<p>Thanks for the reports — keep them coming.</p>
`

const SHORT_HTML = `<p><strong>Build #4821 passed.</strong> 312 tests, 0 failures, 4m 12s.</p>`

const LONG_HTML = Array.from(
  { length: 24 },
  (_, i) => `<p>Line ${i + 1}: auto-height reports this document's real height to the parent.</p>`,
).join('')

const HOSTILE_HTML = `
<p>This message tries five things. None of them work:</p>
<ol>
  <li>An inline script: <script>document.body.innerHTML = '<h1>pwned</h1>'</script><em>did not run</em></li>
  <li>A remote image (tracking pixel): <img src="https://example.com/pixel.gif" alt="remote image (blocked)" width="16" height="16"></li>
  <li>A form posting your data: <form action="https://example.com/steal"><input name="q" value="secret"> <button>Submit</button></form></li>
  <li>An event handler: <img src="data:," alt="onerror handler (blocked)" onerror="alert('xss')"></li>
  <li>A nested frame: <iframe src="https://example.com" title="nested (blocked)" width="120" height="40"></iframe></li>
</ol>
`

function StatusNote({ status }: { status: SandboxFrameStatus | null }) {
  return (
    <p className="text-sm text-muted-foreground" aria-live="polite">
      Status: <span className="font-medium text-foreground">{status ?? '—'}</span>
    </p>
  )
}

function StatesExample() {
  const [status, setStatus] = React.useState<SandboxFrameStatus | null>(null)
  return (
    <div className="space-y-3">
      <SandboxFrame
        title="Self-refreshing message"
        html={'<meta http-equiv="refresh" content="2"><p>This document asks the browser to refresh it after two seconds — a navigation the frame did not ask for.</p>'}
        maxHeight={160}
        onStatusChange={setStatus}
      />
      <StatusNote status={status} />
    </div>
  )
}

export function SandboxFrameExamples({ section }: SandboxFrameExamplesProps) {
  if (section === 'basic') {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <SandboxFrame title="Release notes email" html={NEWSLETTER_HTML} maxHeight={240} />
      </div>
    )
  }

  if (section === 'auto-height') {
    return (
      <div className="grid gap-4 rounded-xl border border-border bg-card p-6 md:grid-cols-2">
        <SandboxFrame title="Build status" html={SHORT_HTML} allowScripts maxHeight={240} />
        <SandboxFrame title="Long report" html={LONG_HTML} allowScripts maxHeight={240} />
      </div>
    )
  }

  if (section === 'hostile') {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <SandboxFrame title="Untrusted message" html={HOSTILE_HTML} allowScripts maxHeight={320} />
      </div>
    )
  }

  if (section === 'states') {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <StatesExample />
      </div>
    )
  }

  return null
}
