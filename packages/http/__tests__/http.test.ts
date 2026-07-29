import { describe, it, expect, vi, afterEach } from 'vitest'
import { HttpClient, HttpError, createHttpClient } from '../src/index.js'

type FetchArgs = [string, RequestInit & { timeout?: number }]

function jsonResponse(data: unknown, init: { status?: number; statusText?: string } = {}) {
  return new Response(JSON.stringify(data), {
    status: init.status ?? 200,
    statusText: init.statusText ?? 'OK',
    headers: { 'content-type': 'application/json' },
  })
}

function mockFetch(impl: (...args: FetchArgs) => Promise<Response>) {
  const fn = vi.fn(impl)
  vi.stubGlobal('fetch', fn)
  return fn
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('HttpClient — request building', () => {
  it('joins baseUrl and endpoint', async () => {
    const fetchMock = mockFetch(() => Promise.resolve(jsonResponse({ ok: true })))
    const client = new HttpClient({ baseUrl: 'https://api.example.com/v1' })
    await client.get('/users')
    expect(fetchMock.mock.calls[0][0]).toBe('https://api.example.com/v1/users')
  })

  it('uses the endpoint as-is without a baseUrl', async () => {
    const fetchMock = mockFetch(() => Promise.resolve(jsonResponse({})))
    const client = new HttpClient()
    await client.get('https://other.example.com/x')
    expect(fetchMock.mock.calls[0][0]).toBe('https://other.example.com/x')
  })

  it('defaults Content-Type to application/json and JSON-stringifies object bodies', async () => {
    const fetchMock = mockFetch(() => Promise.resolve(jsonResponse({})))
    const client = new HttpClient()
    await client.post('/items', { name: 'widget' })
    const [, options] = fetchMock.mock.calls[0]
    expect((options.headers as Record<string, string>)['Content-Type']).toBe('application/json')
    expect(options.body).toBe(JSON.stringify({ name: 'widget' }))
    expect(options.method).toBe('POST')
  })

  it('passes string bodies through untouched', async () => {
    const fetchMock = mockFetch(() => Promise.resolve(jsonResponse({})))
    const client = new HttpClient()
    await client.post('/items', 'raw-body')
    expect(fetchMock.mock.calls[0][1].body).toBe('raw-body')
  })

  it('respects a caller-provided Content-Type', async () => {
    const fetchMock = mockFetch(() => Promise.resolve(jsonResponse({})))
    const client = new HttpClient()
    await client.post('/items', 'a=1', { headers: { 'Content-Type': 'text/plain' } })
    const headers = fetchMock.mock.calls[0][1].headers as Record<string, string>
    expect(headers['Content-Type']).toBe('text/plain')
  })

  it('omits Content-Type for FormData bodies so the runtime sets the boundary', async () => {
    const fetchMock = mockFetch(() => Promise.resolve(jsonResponse({})))
    const client = new HttpClient()
    const form = new FormData()
    form.append('file', 'data')
    await client.post('/upload', form)
    const [, options] = fetchMock.mock.calls[0]
    expect((options.headers as Record<string, string>)['Content-Type']).toBeUndefined()
    expect(options.body).toBe(form)
  })

  it('omits Content-Type for URLSearchParams bodies', async () => {
    const fetchMock = mockFetch(() => Promise.resolve(jsonResponse({})))
    const client = new HttpClient()
    const params = new URLSearchParams({ a: '1' })
    await client.post('/form', params)
    const [, options] = fetchMock.mock.calls[0]
    expect((options.headers as Record<string, string>)['Content-Type']).toBeUndefined()
    expect(options.body).toBe(params)
  })

  it('merges config headers and lets per-request headers win', async () => {
    const fetchMock = mockFetch(() => Promise.resolve(jsonResponse({})))
    const client = new HttpClient({ headers: { 'X-App': 'demo', 'X-Shared': 'config' } })
    await client.get('/x', { headers: { 'X-Shared': 'request' } })
    const headers = fetchMock.mock.calls[0][1].headers as Record<string, string>
    expect(headers['X-App']).toBe('demo')
    expect(headers['X-Shared']).toBe('request')
  })

  it('maps helper methods to HTTP verbs', async () => {
    const fetchMock = mockFetch(() => Promise.resolve(jsonResponse({})))
    const client = new HttpClient()
    await client.get('/x')
    await client.post('/x', {})
    await client.put('/x', {})
    await client.patch('/x', {})
    await client.delete('/x')
    const methods = fetchMock.mock.calls.map((c) => (c[1] as RequestInit).method)
    expect(methods).toEqual(['GET', 'POST', 'PUT', 'PATCH', 'DELETE'])
  })
})

describe('HttpClient — per-request header forms', () => {
  it('merges headers passed as a Headers instance', async () => {
    // Regression guard: a Headers instance used to be silently dropped by the
    // plain-object spread.
    const fetchMock = mockFetch(() => Promise.resolve(jsonResponse({})))
    const client = new HttpClient({ headers: { 'X-App': 'demo' } })
    await client.get('/x', { headers: new Headers({ 'X-Request': 'yes' }) })
    const headers = fetchMock.mock.calls[0][1].headers as Record<string, string>
    expect(headers['x-request']).toBe('yes')
    expect(headers['X-App']).toBe('demo')
  })

  it('merges headers passed as a tuple array', async () => {
    // Regression guard: a tuple array used to be silently dropped too.
    const fetchMock = mockFetch(() => Promise.resolve(jsonResponse({})))
    const client = new HttpClient({ headers: { 'X-App': 'demo' } })
    await client.get('/x', {
      headers: [
        ['X-Request', 'yes'],
        ['X-Extra', '1'],
      ],
    })
    const headers = fetchMock.mock.calls[0][1].headers as Record<string, string>
    expect(headers['X-Request']).toBe('yes')
    expect(headers['X-Extra']).toBe('1')
    expect(headers['X-App']).toBe('demo')
  })

  it('lets a Headers instance override config headers and suppress the default Content-Type', async () => {
    const fetchMock = mockFetch(() => Promise.resolve(jsonResponse({})))
    const client = new HttpClient({ headers: { 'X-Shared': 'config' } })
    // Headers normalizes keys to lowercase — this also exercises the
    // case-insensitive Content-Type dedup.
    await client.post('/x', 'a=1', {
      headers: new Headers({ 'X-Shared': 'request', 'Content-Type': 'text/csv' }),
    })
    const headers = fetchMock.mock.calls[0][1].headers as Record<string, string>
    expect(headers['x-shared']).toBe('request')
    expect(headers['content-type']).toBe('text/csv')
    expect(headers['Content-Type']).toBeUndefined()
  })

  it('does not add a duplicate Content-Type when the caller passes lowercase content-type', async () => {
    // Regression guard: the dedup check used to be case-sensitive, producing
    // both `content-type` and `Content-Type` on the same request.
    const fetchMock = mockFetch(() => Promise.resolve(jsonResponse({})))
    const client = new HttpClient()
    await client.post('/items', 'a=1', { headers: { 'content-type': 'text/plain' } })
    const headers = fetchMock.mock.calls[0][1].headers as Record<string, string>
    expect(headers['content-type']).toBe('text/plain')
    expect(headers['Content-Type']).toBeUndefined()
    const contentTypeKeys = Object.keys(headers).filter((k) => k.toLowerCase() === 'content-type')
    expect(contentTypeKeys).toHaveLength(1)
  })

  it('still defaults Content-Type to application/json alongside other header forms', async () => {
    const fetchMock = mockFetch(() => Promise.resolve(jsonResponse({})))
    const client = new HttpClient()
    await client.post('/items', {}, { headers: new Headers({ 'X-Request': 'yes' }) })
    const headers = fetchMock.mock.calls[0][1].headers as Record<string, string>
    expect(headers['Content-Type']).toBe('application/json')
  })
})

describe('HttpClient — auth header', () => {
  it('adds a Bearer token from a sync getToken', async () => {
    const fetchMock = mockFetch(() => Promise.resolve(jsonResponse({})))
    const client = new HttpClient({ getToken: () => 'tok123' })
    await client.get('/me')
    const headers = fetchMock.mock.calls[0][1].headers as Record<string, string>
    expect(headers.Authorization).toBe('Bearer tok123')
  })

  it('adds a Bearer token from an async getToken', async () => {
    const fetchMock = mockFetch(() => Promise.resolve(jsonResponse({})))
    const client = new HttpClient({ getToken: async () => 'async-tok' })
    await client.get('/me')
    const headers = fetchMock.mock.calls[0][1].headers as Record<string, string>
    expect(headers.Authorization).toBe('Bearer async-tok')
  })

  it('sends no Authorization header when getToken returns null', async () => {
    const fetchMock = mockFetch(() => Promise.resolve(jsonResponse({})))
    const client = new HttpClient({ getToken: () => null })
    await client.get('/me')
    const headers = fetchMock.mock.calls[0][1].headers as Record<string, string>
    expect(headers.Authorization).toBeUndefined()
  })

  it('sends no Authorization header when no getToken is configured', async () => {
    const fetchMock = mockFetch(() => Promise.resolve(jsonResponse({})))
    const client = new HttpClient()
    await client.get('/me')
    const headers = fetchMock.mock.calls[0][1].headers as Record<string, string>
    expect(headers.Authorization).toBeUndefined()
  })
})

describe('HttpClient — response handling', () => {
  it('parses JSON responses by content-type', async () => {
    mockFetch(() => Promise.resolve(jsonResponse({ id: 7 })))
    const client = new HttpClient()
    const res = await client.get<{ id: number }>('/item')
    expect(res.data).toEqual({ id: 7 })
    expect(res.status).toBe(200)
    expect(res.statusText).toBe('OK')
  })

  it('returns text for non-JSON responses', async () => {
    mockFetch(() =>
      Promise.resolve(
        new Response('plain text', { status: 200, headers: { 'content-type': 'text/plain' } }),
      ),
    )
    const client = new HttpClient()
    const res = await client.get<string>('/doc')
    expect(res.data).toBe('plain text')
  })

  it('returns null data for 204 No Content', async () => {
    mockFetch(() => Promise.resolve(new Response(null, { status: 204 })))
    const client = new HttpClient()
    const res = await client.delete('/item/1')
    expect(res.status).toBe(204)
    expect(res.data).toBeNull()
  })

  it('throws HttpError with status and parsed body on HTTP errors', async () => {
    mockFetch(() =>
      Promise.resolve(jsonResponse({ message: 'nope' }, { status: 422, statusText: 'Unprocessable Entity' })),
    )
    const client = new HttpClient()
    const err = await client.post('/items', {}).catch((e) => e)
    expect(err).toBeInstanceOf(HttpError)
    expect(err.status).toBe(422)
    expect(err.statusText).toBe('Unprocessable Entity')
    expect(err.data).toEqual({ message: 'nope' })
    expect(err.message).toContain('422')
  })

  it('throws HttpError for error responses with unparseable bodies', async () => {
    mockFetch(() => Promise.resolve(new Response('oops', { status: 500, statusText: 'Server Error' })))
    const client = new HttpClient()
    const err = await client.get('/boom').catch((e) => e)
    expect(err).toBeInstanceOf(HttpError)
    expect(err.status).toBe(500)
    expect(err.data).toBe('oops')
  })
})

describe('HttpClient — timeout', () => {
  it('aborts the request and rejects with a timeout error', async () => {
    // A fetch that only settles when the client's AbortController fires.
    mockFetch(
      (_url, options) =>
        new Promise<Response>((_resolve, reject) => {
          options.signal?.addEventListener('abort', () => {
            const err = new Error('The operation was aborted')
            err.name = 'AbortError'
            reject(err)
          })
        }),
    )
    const client = new HttpClient({ timeout: 10 })
    await expect(client.get('/slow')).rejects.toThrow('Request timed out after 10ms')
  })

  it('passes an AbortSignal to fetch', async () => {
    const fetchMock = mockFetch(() => Promise.resolve(jsonResponse({})))
    const client = new HttpClient({ timeout: 1000 })
    await client.get('/x')
    expect(fetchMock.mock.calls[0][1].signal).toBeInstanceOf(AbortSignal)
  })

  it('per-request timeout overrides the client default', async () => {
    mockFetch(
      (_url, options) =>
        new Promise<Response>((_resolve, reject) => {
          options.signal?.addEventListener('abort', () => {
            const err = new Error('The operation was aborted')
            err.name = 'AbortError'
            reject(err)
          })
        }),
    )
    const client = new HttpClient({ timeout: 60000 })
    await expect(client.get('/slow', { timeout: 5 })).rejects.toThrow(
      'Request timed out after 5ms',
    )
  })

  it('does not abort requests that settle within the timeout', async () => {
    mockFetch(() => Promise.resolve(jsonResponse({ fast: true })))
    const client = new HttpClient({ timeout: 1000 })
    const res = await client.get<{ fast: boolean }>('/fast')
    expect(res.data).toEqual({ fast: true })
  })
})

describe('createHttpClient', () => {
  it('returns an HttpClient instance', () => {
    expect(createHttpClient()).toBeInstanceOf(HttpClient)
  })
})
