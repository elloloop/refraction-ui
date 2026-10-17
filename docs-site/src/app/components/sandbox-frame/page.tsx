import { SandboxFrameExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'

const sandboxFrameProps = [
  {
    name: 'html',
    type: 'string',
    description: 'The untrusted HTML to display. Inserted verbatim as the frame document’s body; it never runs with your page’s privileges.',
  },
  {
    name: 'title',
    type: 'string',
    description: 'Required accessible name of the frame, announced by screen readers. An empty title throws.',
  },
  {
    name: 'allowScripts',
    type: 'boolean',
    default: 'false',
    description:
      'Adds `allow-scripts` and a nonce-only `script-src`, so the injected height reporter can run (auto-height). The HTML’s own scripts stay blocked. Refused together with `allow-same-origin`.',
  },
  {
    name: 'permissions',
    type: "('allow-same-origin' | 'allow-popups' | 'allow-popups-to-escape-sandbox')[]",
    default: '[]',
    description:
      'Extra sandbox tokens. Anything else (top navigation, forms, downloads, modals, `allow-scripts`) throws; `allow-same-origin` with `allowScripts` throws.',
  },
  {
    name: 'csp',
    type: '{ imgSrc?, mediaSrc?, fontSrc?, styleSrc?, scriptSrc?: string[] }',
    default: "{ imgSrc: ['data:'], styleSrc: [\"'unsafe-inline'\"] }",
    description:
      'CSP source lists. An empty list removes the directive (falls back to `default-src \'none\'`). `scriptSrc` applies only with `allowScripts` and accepts only explicit `https://` hosts (e.g. `https://cdn.example.com`) and `\'sha256-…\'` hashes; wildcards (`https://*`, `*.com`), schemes, host-less or `http:` sources, keywords (`\'unsafe-inline\'`, `\'unsafe-eval\'`, `\'strict-dynamic\'`, …) and nonces are refused.',
  },
  {
    name: 'themeTokens',
    type: 'Record<string, string>',
    description:
      'Theme tokens (name without `--` → value) passed into the frame as CSS custom properties. When omitted, the host’s resolved tokens are read and re-read when the theme changes.',
  },
  {
    name: 'maxHeight',
    type: 'number',
    default: '400',
    description: 'Collapsed height cap in pixels. Taller content gets a “Show more” control.',
  },
  {
    name: 'labels',
    type: 'Partial<{ loading, expand, collapse, navigationBlocked, reload }>',
    description: 'Overrides for the visible strings (localisation).',
  },
  {
    name: 'onStatusChange',
    type: "(status: 'loading' | 'ready' | 'error') => void",
    description: 'Called whenever the status changes, including the initial `loading`.',
  },
  {
    name: 'id',
    type: 'string',
    default: 'useId()',
    description: 'Root id; also the per-instance id the height reporter echoes in its messages.',
  },
  {
    name: 'className',
    type: 'string',
    description: 'Additional CSS classes for the root. Other `div` attributes pass through.',
  },
]

const blockedRows: { what: string; how: string; why: string }[] = [
  {
    what: 'Scripts in the HTML (inline, external, event handlers, javascript: URLs)',
    how: 'sandbox without allow-scripts; with allowScripts, CSP script-src accepts only the injected reporter’s nonce plus any explicit https hosts or hashes you list in csp.scriptSrc — wildcards, schemes and keywords are refused',
    why: 'Untrusted script could read the page, phish inside the frame or abuse your users’ sessions.',
  },
  {
    what: 'Access to your origin (cookies, storage, the parent DOM)',
    how: 'No allow-same-origin: the frame has an opaque origin',
    why: 'Same-origin content could read your cookies, localStorage and DOM. Scripts plus same-origin is refused outright — that combination lets the frame remove its own sandbox.',
  },
  {
    what: 'Network requests: fetch, XHR, WebSocket, EventSource, beacons',
    how: "CSP default-src 'none' (connect-src falls back to it)",
    why: 'Stops data exfiltration and tracking.',
  },
  {
    what: 'Remote images, media and fonts',
    how: 'CSP img-src data: only; media-src and font-src none (configurable via csp)',
    why: 'A remote image is a tracking pixel: it tells the sender who opened the message, when, and from which IP.',
  },
  {
    what: 'Remote stylesheets and @import',
    how: "CSP style-src 'unsafe-inline' only",
    why: 'Inline styles keep email-like HTML looking right; remote CSS could fetch tracking URLs.',
  },
  {
    what: 'Nested frames, <object>, <embed>, workers',
    how: "CSP default-src 'none' (frame-src, object-src, worker-src fall back to it)",
    why: 'Each would load and run content outside these rules.',
  },
  {
    what: 'Form submission',
    how: "sandbox without allow-forms, and CSP form-action 'none'",
    why: 'A fake login form could post credentials anywhere.',
  },
  {
    what: '<base href> hijacking',
    how: "CSP base-uri 'none'",
    why: 'Would silently retarget every relative URL.',
  },
  {
    what: 'Popups and new tabs',
    how: 'sandbox without allow-popups; links default to target="_blank", so they are inert',
    why: 'Prevents pop-up spam and phishing windows. Opt in with permissions.',
  },
  {
    what: 'Navigating your page (top navigation)',
    how: 'sandbox without allow-top-navigation (not grantable)',
    why: 'Would let the message redirect your whole app to a phishing page.',
  },
  {
    what: 'Navigating the frame itself (self-targeted links, meta refresh)',
    how: 'A second load event from the same iframe removes it and shows an error with “Reload preview”',
    why: 'The new page would not carry this CSP. The sandbox still applies to it until it is removed.',
  },
  {
    what: 'Downloads, modals, pointer lock, presentation',
    how: 'sandbox defaults (not grantable)',
    why: 'Drive-by downloads and alert() loops are abuse vectors.',
  },
  {
    what: 'Camera, microphone, geolocation and other powerful features',
    how: 'Permissions Policy denies them to cross-origin (opaque-origin) frames by default',
    why: 'Untrusted content must never prompt for device access.',
  },
  {
    what: 'Referrer leakage',
    how: 'referrerpolicy="no-referrer" plus a no-referrer meta in the document',
    why: 'Any allowed request would otherwise reveal your page URL.',
  },
]

const usageCode = `import { SandboxFrame } from '@refraction-ui/react'

export function MessageBody({ message }: { message: { subject: string; html: string } }) {
  return (
    <SandboxFrame
      title={\`Message: \${message.subject}\`}
      html={message.html}
      maxHeight={480}
      // Opt in to auto-height: only the injected reporter can run.
      allowScripts
      // Allow remote images (privacy trade-off: they act as read receipts).
      csp={{ imgSrc: ['data:', 'https:'] }}
    />
  )
}`

function Code({ children }: { children: React.ReactNode }) {
  return <code className="text-xs bg-muted px-1 rounded">{children}</code>
}

export default function SandboxFramePage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            Component
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Sandbox Frame</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          Shows untrusted HTML — emails, rich message bodies, generated previews — in a locked-down{' '}
          <Code>srcdoc</Code> iframe: an opaque-origin sandbox, a strict Content-Security-Policy, your theme
          tokens, and a height cap with an expand control.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Basic (scripts off)</h2>
        <p className="text-sm text-muted-foreground">
          The default and strictest mode: <Code>sandbox=&quot;&quot;</Code>, so nothing in the frame can run. Because
          no script can measure the document, the frame has a fixed height (<Code>maxHeight</Code>), scrolls inside,
          and always offers “Show more”, which grows it to <Code>80vh</Code>.
        </p>
        <SandboxFrameExamples section="basic" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Auto-height (scripts opt-in)</h2>
        <p className="text-sm text-muted-foreground">
          With <Code>allowScripts</Code>, a tiny reporter is injected into the frame’s <Code>&lt;head&gt;</Code> with
          a fresh CSP nonce. It posts <Code>{'{ type, id, height }'}</Code> to the parent on load and on every resize.
          The HTML’s own scripts are still blocked — only the nonce’d reporter can run. Short content fits exactly;
          content taller than <Code>maxHeight</Code> is clamped and gets “Show more”.
        </p>
        <SandboxFrameExamples section="auto-height" />
        <p className="text-sm text-muted-foreground">
          <strong className="text-foreground">Trade-off:</strong> scripts off is the safest choice but needs a fixed
          height. Scripts on gives exact heights while keeping the frame cross-origin; it is refused together with{' '}
          <Code>allow-same-origin</Code>, because a same-origin script can remove its own sandbox.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">How height messages are trusted</h2>
        <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
          <li>
            The parent accepts a message only when <Code>event.source === iframe.contentWindow</Code>. The origin
            cannot identify the frame: an opaque-origin document reports <Code>event.origin === &quot;null&quot;</Code>,
            exactly like every other sandboxed iframe, <Code>data:</Code> URL or <Code>file:</Code> page.{' '}
            <Code>source</Code> is the sending window object itself, which no other window can impersonate.
          </li>
          <li>
            As defence in depth, the origin must still be <Code>&quot;null&quot;</Code>, the <Code>type</Code> must
            match, and the <Code>id</Code> must be this instance’s (<Code>id</Code> prop or <Code>useId()</Code>).
          </li>
          <li>
            Heights must be finite and non-negative and are clamped to 20,000 px — even an expanded frame cannot be
            made arbitrarily tall by its content.
          </li>
          <li>
            Each document gets its own iframe element, so reports from a previous document are ignored.
          </li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Hostile HTML</h2>
        <p className="text-sm text-muted-foreground">
          The message below contains an inline script, a tracking pixel, a form, an <Code>onerror</Code> handler and
          a nested frame. Scripts are allowed here (for auto-height) and still none of them work.
        </p>
        <SandboxFrameExamples section="hostile" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Loading and error states</h2>
        <p className="text-sm text-muted-foreground">
          While the document loads the frame shows a “Loading preview…” status and <Code>aria-busy</Code>. If the
          content navigates the frame away from its own document (a self-targeted link, or here a{' '}
          <Code>&lt;meta http-equiv=&quot;refresh&quot;&gt;</Code>), the frame is removed and replaced by an alert with
          “Reload preview”.
        </p>
        <SandboxFrameExamples section="states" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">What is blocked and why</h2>
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full text-sm">
            <caption className="sr-only">What SandboxFrame blocks, how, and why</caption>
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Blocked</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">By</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Why</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {blockedRows.map((row) => (
                <tr key={row.what}>
                  <th scope="row" className="px-4 py-3 text-left align-top font-medium text-foreground">{row.what}</th>
                  <td className="px-4 py-3 align-top text-muted-foreground">{row.how}</td>
                  <td className="px-4 py-3 align-top text-muted-foreground">{row.why}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
          <li>
            <strong className="text-foreground">Not blocked:</strong> inline styles and <Code>data:</Code> images (so
            HTML email renders), and CSS-only effects inside the frame’s own box. Some browsers may still resolve DNS
            for hostnames named in the markup (DNS prefetch is not governed by CSP everywhere).
          </li>
          <li>
            Your page’s own CSP also applies: a <Code>srcdoc</Code> document inherits it, and policies only ever add
            restrictions. A <Code>&lt;meta&gt;</Code> CSP inside the untrusted HTML can tighten the policy, never loosen
            it.
          </li>
          <li>
            The frame document is built on the client after mount (it needs a random nonce and your resolved theme),
            so server-rendered HTML contains the loading shell and never the untrusted markup.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Installation</h2>
        <InstallCommand frameworkPackages={{ react: '@refraction-ui/react' }} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2>
        <CodeBlock frameworks={{ react: usageCode }} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Accessibility</h2>
        <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
          <li>
            <Code>title</Code> is required and becomes the iframe’s accessible name. The iframe stays in the tab order
            (so a fixed-height frame can be scrolled from the keyboard) and shows a focus ring.
          </li>
          <li>
            “Show more” / “Show less” is a native button with <Code>aria-expanded</Code> and{' '}
            <Code>aria-controls</Code>, a visible focus ring and a 44 px minimum target. States are spelled out in
            text: a <Code>role=&quot;status&quot;</Code> loading message and a <Code>role=&quot;alert&quot;</Code> error
            — never colour alone.
          </li>
          <li>
            The height transition and spinner stop under <Code>prefers-reduced-motion</Code>, and the frame’s base
            stylesheet stops animations in the untrusted HTML too.
          </li>
          <li>
            Text uses your theme’s tokens inside the frame, so contrast follows light, dark and system themes. Content
            authors can still choose low-contrast colours in their own inline styles.
          </li>
        </ul>
      </section>

      <div className="h-px bg-border" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Props</h2>
        <PropsTable props={sandboxFrameProps} />
      </section>
    </div>
  )
}
