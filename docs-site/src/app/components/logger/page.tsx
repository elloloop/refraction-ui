import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'

const configProps = [
  { name: 'app', type: 'string', description: 'Logical app/service name attached to every record. Required.' },
  { name: 'env', type: "'development' | 'production'", description: 'Selects a behavior preset (level, batching, sampling, flush). Required.' },
  { name: 'endpoint', type: 'string', description: 'Remote collector URL. When omitted, telemetry stays console-only and no network engine is constructed.' },
  { name: 'enabled', type: 'boolean', default: 'true', description: 'Master kill switch. When false a tree-shakeable noop logger is returned — zero records, no engine import, zero runtime cost.' },
  { name: 'sampleRate', type: 'number', default: 'preset', description: 'Fraction of records kept, 0..1. Defaults to the preset value (1 in development, 0.25 in production).' },
  { name: 'redactKeys', type: 'string[]', default: '[]', description: 'Context keys to strip (deep, case-insensitive) before a record is emitted. Use for PII / secrets.' },
]

const loggerMembers = [
  { name: 'debug / info / warn / error / fatal', type: '(message: string, context?: LogContext) => void', description: 'Emit a structured record at that level. Dropped if below the preset min level or filtered by the sample rate.' },
  { name: 'child', type: '(context: LogContext) => Logger', description: 'Derive a logger with merged bound context (e.g. sessionId, interviewId, turnId). The parent is unaffected.' },
  { name: 'startSpan', type: '(name: string, attributes?: LogContext) => Span', description: 'Begin a timed span for an async flow. Call span.end() to record its duration.' },
  { name: 'flush', type: '() => Promise<void>', description: 'Deliver buffered records (batched presets) and flush every sink. Resolves once delivery is attempted.' },
]

const spanMembers = [
  { name: 'end', type: '(opts?: { error?: unknown; attributes?: LogContext }) => void', description: 'End the span and emit a SpanRecord. opts.error sets status to "error"; opts.attributes merges in. Idempotent — a second call is a no-op.' },
]

const telemetryMembers = [
  { name: 'sinks', type: 'readonly string[]', description: 'Registered sink names, in insertion order.' },
  { name: 'addSink', type: '(sink: TelemetrySink) => void', description: 'Register an additional sink (e.g. a custom collector). Same name replaces the existing sink.' },
  { name: 'removeSink', type: '(name: string) => void', description: 'Remove a sink by name.' },
]

const providerProps = [
  { name: 'value', type: 'Telemetry', description: 'A telemetry instance from createTelemetry(). Create it once, outside render.' },
  { name: 'children', type: 'React.ReactNode', description: 'Subtree that gains access to the logger via useLogger / useSpan.' },
]

const presetRows = [
  { name: 'min level', type: 'debug', default: 'warn', description: 'development emits everything; production drops below warn.' },
  { name: 'delivery', type: 'sync', default: 'batched (size 20)', description: 'development delivers immediately; production buffers and flushes in batches.' },
  { name: 'sample rate', type: '1', default: '0.25', description: 'development keeps every record; production keeps a quarter by default.' },
  { name: 'console output', type: 'pretty', default: 'structured JSON', description: 'development is human-readable; production is machine-parseable.' },
  { name: 'beacon flush on exit', type: 'no', default: 'yes', description: 'production flushes on pagehide + visibilitychange (hidden) so in-flight data is not lost.' },
]

const installCode = `# core (always)
pnpm add @refraction-ui/logger

# React adapter
pnpm add @refraction-ui/react-logger

# optional — only needed when you set an \`endpoint\`
pnpm add @grafana/faro-web-sdk @grafana/faro-web-tracing`

const quickStartCode = `import { createTelemetry } from '@refraction-ui/logger'

// Create ONCE, outside React render.
export const telemetry = createTelemetry({
  app: 'interview-service',
  env: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  endpoint: process.env.NEXT_PUBLIC_TELEMETRY_ENDPOINT, // optional
  sampleRate: 0.25,                                      // optional
  redactKeys: ['password', 'token', 'authorization'],    // optional
  enabled: true,                                         // optional (default true)
})

telemetry.warn('rate limited', { route: '/v1/answer' })

// Child loggers carry bound context onto every downstream record.
const session = telemetry.child({ sessionId: 's-123' })
const turn = session.child({ turnId: 't-7' })

const span = turn.startSpan('llm-call', { model: 'gpt' })
try {
  // ... async work ...
  span.end()
} catch (err) {
  span.end({ error: err })
}

await telemetry.flush()`

const devProdCode = `// Zero-config dev: no endpoint -> console-only, pretty, level=debug, sync.
const dev = createTelemetry({ app: 'studio', env: 'development' })
dev.debug('cache miss', { key: 'user:42' }) // printed immediately, pretty

// Production: batched + sampled + level>=warn + structured JSON +
// beacon flush on pagehide / visibilitychange. Same call sites,
// different runtime behavior — no code changes needed.
const prod = createTelemetry({
  app: 'studio',
  env: 'production',
  endpoint: 'https://collector.example/ingest',
})
prod.debug('cache miss')             // dropped (below warn)
prod.error('checkout failed', { orderId: 'o-9' }) // buffered, sampled, flushed`

const killSwitchCode = `// enabled: false returns a tree-shakeable noop logger. Every method is a
// no-op, no engine is ever imported, and bundlers can drop the call sites.
// Zero runtime cost — the ideal "logging off in this build" switch.
const telemetry = createTelemetry({
  app: 'interview-service',
  env: 'production',
  enabled: process.env.NEXT_PUBLIC_TELEMETRY !== 'off', // flip per build/env
})

// When disabled these compile and run, but emit nothing and cost nothing:
telemetry.info('app booted')
telemetry.child({ sessionId: 's-1' }).warn('slow turn')
telemetry.startSpan('noop-span').end()
await telemetry.flush() // resolves immediately`

const providerCode = `// app/providers.tsx
'use client'

import { TelemetryProvider } from '@refraction-ui/react-logger'
import { createTelemetry } from '@refraction-ui/logger'

// Created once at module scope — never re-created on render.
const telemetry = createTelemetry({
  app: 'interview-app',
  env: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  endpoint: process.env.NEXT_PUBLIC_TELEMETRY_ENDPOINT,
})

export function Providers({ children }: { children: React.ReactNode }) {
  return <TelemetryProvider value={telemetry}>{children}</TelemetryProvider>
}`

const useLoggerCode = `'use client'

import { useLogger } from '@refraction-ui/react-logger'

export function AnswerButton({ questionId }: { questionId: string }) {
  // Scope string -> bound context { scope }. Stable across renders.
  const log = useLogger('answer-button')

  return (
    <button
      onClick={() => {
        log.info('answer submitted', { questionId })
      }}
    >
      Submit answer
    </button>
  )
}`

const useSpanCode = `'use client'

import { useSpan } from '@refraction-ui/react-logger'

export function TranscribeControl({ clipId }: { clipId: string }) {
  // useSpan() returns a stable startSpan bound to the provider's logger.
  const startSpan = useSpan()

  async function transcribe() {
    const span = startSpan('transcribe-clip', { clipId })
    try {
      await fetch('/api/transcribe', { method: 'POST' })
      span.end()
    } catch (err) {
      span.end({ error: err })
    }
  }

  return <button onClick={transcribe}>Transcribe</button>
}`

const errorBoundaryCode = `// app/providers.tsx
'use client'

import {
  TelemetryProvider,
  TelemetryErrorBoundary,
} from '@refraction-ui/react-logger'
import { createTelemetry } from '@refraction-ui/logger'

const telemetry = createTelemetry({ app: 'interview-app', env: 'production' })

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TelemetryProvider value={telemetry}>
      {/* Any thrown render error is logged at error level with the
          component stack, then the fallback is shown. */}
      <TelemetryErrorBoundary
        fallback={<p>Something went wrong. The team has been notified.</p>}
      >
        {children}
      </TelemetryErrorBoundary>
    </TelemetryProvider>
  )
}`

const aiInterviewCode = `'use client'

import { useEffect } from 'react'
import { useLogger } from '@refraction-ui/react-logger'

/**
 * AI interview / live meeting: a long-lived session with many nested,
 * overlapping async spans. Child loggers thread sessionId / interviewId /
 * turnId onto every record and span so a whole interview is one query.
 */
export function useInterviewTelemetry(interviewId: string) {
  const log = useLogger('ai-interview')

  useEffect(() => {
    // One logger per interview; turn loggers branch off it.
    const interview = log.child({ interviewId })
    const sessionSpan = interview.startSpan('interview-session')
    interview.info('interview started')

    let cancelled = false

    async function runTurn(turnId: string, prompt: string) {
      const turn = interview.child({ turnId })

      // Outer span covers the whole turn; inner spans cover each phase.
      const turnSpan = turn.startSpan('turn')
      try {
        const sttSpan = turn.startSpan('speech-to-text')
        const transcript = await transcribe(prompt)
        sttSpan.end({ attributes: { chars: transcript.length } })

        const llmSpan = turn.startSpan('llm-answer', { model: 'gpt' })
        const answer = await askModel(transcript)
        llmSpan.end()

        const ttsSpan = turn.startSpan('text-to-speech')
        await speak(answer)
        ttsSpan.end()

        turn.info('turn complete')
        turnSpan.end()
      } catch (err) {
        turn.error('turn failed', { phase: 'unknown' })
        turnSpan.end({ error: err })
      }
    }

    void (async () => {
      await runTurn('t-1', 'Tell me about yourself.')
      if (!cancelled) await runTurn('t-2', 'Why this role?')
      sessionSpan.end()
      interview.info('interview finished')
      // Force-deliver everything (matters under the production preset).
      await interview.flush()
    })()

    return () => {
      cancelled = true
      // Page/route exit while a turn is mid-flight: close the session span
      // with the reason and flush before unmount.
      sessionSpan.end({ attributes: { endedBy: 'unmount' } })
      void interview.flush()
    }
  }, [interviewId, log])
}

// --- stand-ins for your real async pipeline ---
declare function transcribe(input: string): Promise<string>
declare function askModel(transcript: string): Promise<string>
declare function speak(text: string): Promise<void>`

export default function LoggerPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">Library</span>
          <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">Headless</span>
          <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">React</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Logger / Telemetry</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          A headless, vendor-neutral telemetry core that makes logging trivial for complex async
          flows — AI interviews, live meetings, streaming pipelines. Internally Faro-backed, but
          Faro is fully hidden: your only wiring is an optional collector endpoint. Mirrors the
          {' '}<code className="text-sm font-mono bg-muted px-1.5 py-0.5 rounded-md">@refraction-ui/ai</code> provider pattern.
        </p>
      </div>

      {/* Install */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Installation</h2>
        <InstallCommand packageName="@refraction-ui/react-logger" />
        <p className="text-sm text-muted-foreground">
          The React adapter pulls in the <code className="text-sm font-mono bg-muted px-1.5 py-0.5 rounded-md">@refraction-ui/logger</code> core.
          The Grafana Faro packages are <strong>optional peer dependencies</strong> — install them only
          when you configure an <code className="text-sm font-mono bg-muted px-1.5 py-0.5 rounded-md">endpoint</code>;
          without them the logger silently stays console-only.
        </p>
        <CodeBlock code={installCode} language="bash" />
      </section>

      <div className="h-px bg-border" />

      {/* createTelemetry */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">createTelemetry</h2>
        <p className="text-sm text-muted-foreground">
          The entire core public surface is a single factory. It returns a <code className="text-sm font-mono bg-muted px-1.5 py-0.5 rounded-md">Telemetry</code> —
          which <em>is</em> a logger bound to an empty root context, plus sink management.
        </p>
        <CodeBlock code={quickStartCode} />
        <h3 className="text-base font-semibold tracking-tight text-foreground pt-2">Config</h3>
        <PropsTable props={configProps} />
      </section>

      <div className="h-px bg-border" />

      {/* Dev vs prod */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Development vs Production</h2>
        <p className="text-sm text-muted-foreground">
          The <code className="text-sm font-mono bg-muted px-1.5 py-0.5 rounded-md">env</code> field selects a
          behavior preset. Call sites never change — only the runtime behavior does.
        </p>
        <PropsTable props={presetRows.map((r) => ({ name: r.name, type: `dev: ${r.type}`, default: `prod: ${r.default}`, description: r.description }))} />
        <CodeBlock code={devProdCode} />
      </section>

      <div className="h-px bg-border" />

      {/* Kill switch */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Kill Switch</h2>
        <p className="text-sm text-muted-foreground">
          <code className="text-sm font-mono bg-muted px-1.5 py-0.5 rounded-md">enabled: false</code> returns a
          tree-shakeable noop logger: zero emissions, no engine import, zero runtime cost. Wire it to a
          build-time flag or environment variable to turn telemetry fully off without touching call sites.
        </p>
        <CodeBlock code={killSwitchCode} />
      </section>

      <div className="h-px bg-border" />

      {/* React API */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">React: TelemetryProvider</h2>
        <p className="text-sm text-muted-foreground">
          Create the telemetry instance once at module scope and pass it to{' '}
          <code className="text-sm font-mono bg-muted px-1.5 py-0.5 rounded-md">TelemetryProvider</code>.
          Everything below gets the logger through hooks — no prop drilling.
        </p>
        <CodeBlock code={providerCode} />
        <h3 className="text-base font-semibold tracking-tight text-foreground pt-2">TelemetryProvider Props</h3>
        <PropsTable props={providerProps} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">React: useLogger(scope)</h2>
        <p className="text-sm text-muted-foreground">
          <code className="text-sm font-mono bg-muted px-1.5 py-0.5 rounded-md">useLogger(scope)</code> returns a
          child logger bound to <code className="text-sm font-mono bg-muted px-1.5 py-0.5 rounded-md">{'{ scope }'}</code>,
          stable across renders. Use one scope per component or feature.
        </p>
        <CodeBlock code={useLoggerCode} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">React: useSpan()</h2>
        <p className="text-sm text-muted-foreground">
          <code className="text-sm font-mono bg-muted px-1.5 py-0.5 rounded-md">useSpan()</code> returns a stable
          <code className="text-sm font-mono bg-muted px-1.5 py-0.5 rounded-md">startSpan</code> bound to the
          provider&apos;s logger — ideal for timing one-off async actions inside event handlers.
        </p>
        <CodeBlock code={useSpanCode} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">React: TelemetryErrorBoundary</h2>
        <p className="text-sm text-muted-foreground">
          A React error boundary that logs any thrown render error at <code className="text-sm font-mono bg-muted px-1.5 py-0.5 rounded-md">error</code> level
          (with the component stack) through the nearest provider, then renders a fallback.
        </p>
        <CodeBlock code={errorBoundaryCode} />
      </section>

      <div className="h-px bg-border" />

      {/* AI interview / live meeting async spans */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">AI Interview / Live Meeting (async spans)</h2>
        <p className="text-sm text-muted-foreground">
          The reason this library exists: long-lived sessions with many nested, overlapping async
          spans. Child loggers thread <code className="text-sm font-mono bg-muted px-1.5 py-0.5 rounded-md">sessionId</code> /{' '}
          <code className="text-sm font-mono bg-muted px-1.5 py-0.5 rounded-md">interviewId</code> /{' '}
          <code className="text-sm font-mono bg-muted px-1.5 py-0.5 rounded-md">turnId</code> onto every record
          and span, so an entire interview — speech-to-text, the LLM answer, text-to-speech — is one
          query in your collector. Unmount mid-turn closes the session span and flushes.
        </p>
        <CodeBlock code={aiInterviewCode} />
      </section>

      <div className="h-px bg-border" />

      {/* API reference */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Logger</h2>
        <PropsTable props={loggerMembers} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Span</h2>
        <PropsTable props={spanMembers} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Telemetry (extends Logger)</h2>
        <PropsTable props={telemetryMembers} />
      </section>
    </div>
  )
}
