import type {
  Analytics,
  AnalyticsConfig,
  AnalyticsContext,
  AnalyticsEvent,
  AnalyticsEventType,
  AnalyticsSink,
  CallOptions,
  SinkDeliverContext,
} from './types.js'
import { SCHEMA_VERSION } from './types.js'
import { uuidv4 } from './uuid.js'
import { createSession, campaignFingerprint } from './session.js'
import { createIdentity } from './identity.js'
import { createConsent } from './consent.js'
import { createRedactor } from './redaction.js'
import { createHttpSink } from './http-sink.js'
import { createConsoleSink } from './console-sink.js'
import { createNoopAnalytics } from './noop.js'

const LIBRARY = {
  name: '@refraction-ui/analytics',
  version: '0.1.0',
}

/** Read the current page block from the DOM, if any (browser-only). */
function readPage(): AnalyticsContext['page'] | undefined {
  const g = globalThis as unknown as {
    location?: { pathname?: string; href?: string; search?: string }
    document?: { title?: string; referrer?: string }
  }
  if (!g.location && !g.document) return undefined
  return {
    path: g.location?.pathname,
    url: g.location?.href,
    search: g.location?.search,
    title: g.document?.title,
    referrer: g.document?.referrer,
  }
}

/**
 * createAnalytics — the neutral Segment-spec collector/router.
 *
 * Mirrors `createAI`: a single factory returns the entire public surface and
 * fans the canonical envelope out to registered sinks. There is NO privileged
 * engine — the built-in HTTP sink and every vendor adapter are equal sinks.
 *
 * Presets:
 *   dev  — synchronous delivery + a console sink (see exactly what ships).
 *   prod — batching + sampling + beacon flush on pagehide/visibilitychange.
 *
 * When `enabled: false`, a tree-shakeable noop is returned and none of the
 * live collector / sink code is reachable.
 */
export function createAnalytics(config: AnalyticsConfig): Analytics {
  if (config.enabled === false) {
    return createNoopAnalytics()
  }

  const { app, env } = config
  const preset =
    config.preset ?? (env === 'production' ? 'prod' : 'dev')
  const sampleRate = config.sampleRate ?? 1
  const batchSize = config.batchSize ?? 20
  const flushIntervalMs = config.flushIntervalMs ?? 10_000

  const session = createSession(config.session)
  const identity = createIdentity(config.identity)
  const consent = createConsent(config.consent)
  const redactor = createRedactor(config.redactKeys)

  // --- Sink registry ------------------------------------------------------
  const sinks = new Map<string, AnalyticsSink>()
  const sinkOrder: string[] = []
  const initialized = new Set<string>()

  function registerSink(sink: AnalyticsSink): void {
    if (!sinks.has(sink.name)) sinkOrder.push(sink.name)
    sinks.set(sink.name, sink)
  }

  // Auto HTTP sink when an endpoint is supplied.
  if (config.endpoint) {
    registerSink(
      createHttpSink({
        endpoint: config.endpoint,
        writeKey: config.writeKey ?? '',
      }),
    )
  }
  // dev preset → add a console sink for visibility.
  if (preset === 'dev') {
    registerSink(createConsoleSink())
  }
  // Explicit sinks (override same-named built-ins).
  for (const s of config.sinks ?? []) registerSink(s)

  /**
   * Initialise a sink at most once. Returns a promise only when the sink's
   * own `init` is async — synchronous sinks stay on the synchronous path so
   * the dev preset delivers without a microtask hop.
   */
  function ensureInit(sink: AnalyticsSink): void | Promise<void> {
    if (initialized.has(sink.name)) return
    initialized.add(sink.name)
    if (sink.init) {
      return sink.init({ app, env, endpoint: config.endpoint })
    }
  }

  // --- Batch buffer -------------------------------------------------------
  const buffer: AnalyticsEvent[] = []
  let timer: ReturnType<typeof setInterval> | undefined

  function startTimer(): void {
    if (preset !== 'prod' || timer) return
    timer = setInterval(() => {
      void flush(false)
    }, flushIntervalMs)
    // Do not keep a Node process alive purely for the flush timer.
    ;(timer as unknown as { unref?: () => void }).unref?.()
  }

  /**
   * Fan a batch out to every consented sink. Stays fully synchronous when all
   * sinks are synchronous (dev preset visibility); returns a promise only if a
   * sink's init/deliver is async.
   */
  function deliverToSinks(
    batch: AnalyticsEvent[],
    unload: boolean,
  ): void | Promise<void> {
    if (batch.length === 0) return
    const ctx: SinkDeliverContext = { unload }
    const pending: Array<Promise<unknown>> = []
    for (const name of sinkOrder) {
      const sink = sinks.get(name)
      if (!sink) continue
      if (!consent.allows(sink.consentCategories)) continue
      const inited = ensureInit(sink)
      if (inited && typeof (inited as Promise<void>).then === 'function') {
        pending.push(
          (inited as Promise<void>).then(() => sink.deliver(batch, ctx)),
        )
      } else {
        const r = sink.deliver(batch, ctx)
        if (r && typeof (r as Promise<void>).then === 'function') {
          pending.push(r as Promise<void>)
        }
      }
    }
    if (pending.length) return Promise.all(pending).then(() => undefined)
  }

  async function flush(unload = false): Promise<void> {
    const batch = buffer.splice(0, buffer.length)
    await deliverToSinks(batch, unload)
    for (const name of sinkOrder) {
      const sink = sinks.get(name)
      if (sink?.flush && consent.allows(sink.consentCategories)) {
        await sink.flush()
      }
    }
  }

  // --- Unload flush (prod) ------------------------------------------------
  function bindUnload(): void {
    if (preset !== 'prod') return
    const g = globalThis as unknown as {
      addEventListener?: (t: string, h: () => void) => void
      document?: { visibilityState?: string }
    }
    if (typeof g.addEventListener !== 'function') return
    const onUnload = (): void => {
      void deliverToSinks(buffer.splice(0, buffer.length), true)
    }
    g.addEventListener('pagehide', onUnload)
    g.addEventListener('visibilitychange', () => {
      if (g.document?.visibilityState === 'hidden') onUnload()
    })
  }

  startTimer()
  bindUnload()

  // --- Envelope construction ---------------------------------------------
  function buildContext(
    extra?: Partial<AnalyticsContext>,
    childCtx?: Partial<AnalyticsContext>,
  ): AnalyticsContext {
    const page = readPage()
    return {
      app,
      env,
      ...(page ? { page } : {}),
      ...childCtx,
      ...extra,
      library: LIBRARY,
    }
  }

  function sampled(): boolean {
    if (sampleRate >= 1) return true
    if (sampleRate <= 0) return false
    return Math.random() < sampleRate
  }

  function enqueue(ev: AnalyticsEvent): void {
    if (preset === 'dev') {
      // Synchronous, unbatched — immediate visibility.
      void deliverToSinks([ev], false)
      return
    }
    buffer.push(ev)
    if (buffer.length >= batchSize) {
      void flush(false)
    }
  }

  function emit(
    type: AnalyticsEventType,
    fields: Partial<AnalyticsEvent>,
    childCtx: Partial<AnalyticsContext> | undefined,
    opts?: CallOptions,
  ): void {
    if (!sampled()) return

    const page = readPage()
    const campaign = campaignFingerprint(page?.search)
    const sessionId = session.touch(campaign)
    const sessionProps = session.props()

    const ev: AnalyticsEvent = {
      type,
      messageId: uuidv4(),
      anonymousId: identity.anonymousId(),
      userId: identity.userId(),
      sessionId,
      context: buildContext(opts?.context, childCtx),
      timestamp: opts?.timestamp ?? new Date().toISOString(),
      schemaVersion: SCHEMA_VERSION,
      ...fields,
    }

    // Merge session-scoped props beneath call props.
    if (sessionProps && (ev.properties || type === 'track' || type === 'page' || type === 'screen')) {
      ev.properties = { ...sessionProps, ...(ev.properties ?? {}) }
    }

    enqueue(ev)
  }

  function makeApi(childCtx?: Partial<AnalyticsContext>): Analytics {
    const api: Analytics = {
      track(event, properties, opts) {
        emit(
          'track',
          { event, properties: redactor.redact(properties) },
          childCtx,
          opts,
        )
      },

      identify(userId, traits, opts) {
        identity.setUserId(userId)
        emit('identify', { traits: redactor.redact(traits) }, childCtx, opts)
      },

      page(name, properties, opts) {
        emit(
          'page',
          { event: name, properties: redactor.redact(properties) },
          childCtx,
          opts,
        )
      },

      screen(name, properties, opts) {
        emit(
          'screen',
          { event: name, properties: redactor.redact(properties) },
          childCtx,
          opts,
        )
      },

      group(groupId, traits, opts) {
        emit(
          'group',
          { groupId, traits: redactor.redact(traits) },
          childCtx,
          opts,
        )
      },

      alias(userId, previousId, opts) {
        const stitch = identity.alias(userId, previousId)
        emit(
          'alias',
          { userId: stitch.userId, previousId: stitch.previousId },
          childCtx,
          opts,
        )
      },

      session: {
        id: () => session.id(),
        start: () => session.start(),
        end: () => session.end(),
        set: (props) => session.set(props),
      },

      consent: {
        grant: (...c) => consent.grant(...c),
        revoke: (...c) => consent.revoke(...c),
        granted: () => consent.granted(),
        isGranted: (c) => consent.isGranted(c),
      },

      anonymousId: () => identity.anonymousId(),
      userId: () => identity.userId(),

      with(extra: Partial<AnalyticsContext>): Analytics {
        return makeApi({ ...childCtx, ...extra })
      },

      addSink(sink: AnalyticsSink): void {
        registerSink(sink)
      },

      removeSink(name: string): void {
        if (sinks.has(name)) {
          sinks.delete(name)
          const i = sinkOrder.indexOf(name)
          if (i !== -1) sinkOrder.splice(i, 1)
          initialized.delete(name)
        }
      },

      get sinks(): string[] {
        return [...sinkOrder]
      },

      async flush(): Promise<void> {
        await flush(false)
      },

      reset(): void {
        identity.reset()
        session.end()
      },

      enabled: true,
    }

    return api
  }

  return makeApi()
}
