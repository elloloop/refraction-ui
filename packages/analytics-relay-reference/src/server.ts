/**
 * Thin Node `http` binding for the reference relay.
 *
 * Zero dependencies — uses only Node's built-in `http`. The collector
 * (collector.ts) holds all wire-contract logic; this only reads the body
 * and maps the {status, body} result onto the response. The conformance
 * suite drives a real socket through this so the core `http` sink is
 * validated against the actual on-the-wire behaviour.
 */

import { createServer, type Server } from 'node:http'
import { AddressInfo } from 'node:net'
import { createRelay, type RelayOptions, type AnalyticsRelay } from './collector.js'

export interface NodeRelayServer {
  /** The underlying relay (queue/dedupe/fan-out introspection for tests). */
  readonly relay: AnalyticsRelay
  /** Start listening; resolves with the bound base URL (e.g. http://127.0.0.1:PORT). */
  listen(port?: number): Promise<string>
  close(): Promise<void>
  readonly server: Server
}

const MAX_BODY_BYTES = 2_000_000 // hard ceiling — refuse abusive bodies early

export function createNodeRelayServer(
  options: RelayOptions,
): NodeRelayServer {
  const relay = createRelay(options)

  const server = createServer((req, res) => {
    const chunks: Buffer[] = []
    let size = 0
    let aborted = false

    req.on('data', (c: Buffer) => {
      size += c.length
      if (size > MAX_BODY_BYTES) {
        aborted = true
        res.writeHead(413, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ success: false, error: 'body too large' }))
        req.destroy()
        return
      }
      chunks.push(c)
    })

    req.on('end', () => {
      if (aborted) return
      void (async () => {
        const result = await relay.handleRequest({
          method: req.method ?? 'GET',
          url: req.url ?? '/',
          headers: req.headers as Record<string, string | undefined>,
          rawBody: Buffer.concat(chunks).toString('utf8'),
          receivedAt: Date.now(),
        })
        res.writeHead(result.status, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify(result.body))
      })()
    })

    req.on('error', () => {
      if (!res.headersSent) {
        res.writeHead(400, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ success: false, error: 'request error' }))
      }
    })
  })

  return {
    relay,
    server,
    listen(port = 0) {
      return new Promise<string>((resolve, reject) => {
        server.once('error', reject)
        server.listen(port, '127.0.0.1', () => {
          const addr = server.address() as AddressInfo
          resolve(`http://127.0.0.1:${addr.port}`)
        })
      })
    },
    close() {
      return new Promise<void>((resolve, reject) => {
        server.close((err) => (err ? reject(err) : resolve()))
      })
    },
  }
}
