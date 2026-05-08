/**
 * Example: nodejs-express-rest-api (Flow 65)
 *
 * A small Express server that exposes a handful of Klever-blockchain endpoints.
 * Demonstrates:
 *
 *   - per-route handlers with shared `KleverProvider` / `NodeWallet` setup
 *   - JSON request/response shape
 *   - GET /health for liveness probes
 *   - graceful shutdown on SIGINT / SIGTERM
 *   - JSON-safe stringify (bigint -> string)
 *
 * Endpoints:
 *
 *   GET  /health                   { ok: true, network }
 *   GET  /balance?address=…&asset= { balance, asset, address }
 *   GET  /account?address=…        { ...IAccount }
 *   GET  /tx/:hash                 { ...ITransactionResponse }
 *   POST /transfer                 { hash, status }   (requires PRIVATE_KEY)
 *
 * Salvages and TS-rewrites `_legacy/nodejs/server/src/server.js`.
 */

import 'node:process'
import express, {
  type Request,
  type Response,
  type NextFunction,
} from 'express'

import {
  KleverProvider,
  NodeWallet,
  isValidAddress,
  parseKLV,
  type KleverAddress,
  type TransactionHash,
} from '@klever/connect'

const NETWORK = (process.env['KLV_NETWORK'] ?? 'testnet') as
  | 'mainnet'
  | 'testnet'
  | 'devnet'
  | 'local'
const PORT = Number(process.env['PORT'] ?? '3000')
const PRIVATE_KEY = process.env['PRIVATE_KEY']

const provider = new KleverProvider({ network: NETWORK })
const app = express()
app.use(express.json())

// JSON-safe stringify replacer — converts bigints to strings so the response
// can serialize without throwing.
function safeJson(obj: unknown): string {
  return JSON.stringify(obj, (_k, v) => (typeof v === 'bigint' ? v.toString() : v))
}

function sendJson(res: Response, body: unknown, status = 200): void {
  res.status(status).type('application/json').send(safeJson(body))
}

app.get('/health', (_req: Request, res: Response): void => {
  sendJson(res, { ok: true, network: NETWORK, timestamp: Date.now() })
})

app.get('/balance', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const addr = String(req.query['address'] ?? '')
    const asset = String(req.query['asset'] ?? 'KLV')
    if (!isValidAddress(addr)) {
      sendJson(res, { error: 'invalid address' }, 400)
      return
    }
    const balance = await provider.getBalance(addr as KleverAddress, asset)
    sendJson(res, { address: addr, asset, balance })
  } catch (e) {
    next(e)
  }
})

app.get('/account', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const addr = String(req.query['address'] ?? '')
    if (!isValidAddress(addr)) {
      sendJson(res, { error: 'invalid address' }, 400)
      return
    }
    const account = await provider.getAccount(addr as KleverAddress)
    sendJson(res, account)
  } catch (e) {
    next(e)
  }
})

app.get('/tx/:hash', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const hash = req.params['hash']
    if (!hash || hash.length < 8) {
      sendJson(res, { error: 'invalid hash' }, 400)
      return
    }
    const tx = await provider.getTransaction(hash as TransactionHash)
    if (!tx) {
      sendJson(res, { error: 'not found' }, 404)
      return
    }
    sendJson(res, tx)
  } catch (e) {
    next(e)
  }
})

app.post('/transfer', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!PRIVATE_KEY) {
      sendJson(res, { error: 'PRIVATE_KEY is not configured on the server' }, 503)
      return
    }
    const body = req.body as { to?: string; amount?: string; asset?: string } | undefined
    if (!body?.to || !isValidAddress(body.to)) {
      sendJson(res, { error: 'invalid or missing "to"' }, 400)
      return
    }
    if (!body.amount) {
      sendJson(res, { error: 'missing "amount"' }, 400)
      return
    }
    const wallet = new NodeWallet(provider, PRIVATE_KEY)
    await wallet.connect()
    const isKLV = !body.asset || body.asset === 'KLV'
    const result = await wallet.transfer({
      receiver: body.to,
      amount: isKLV ? parseKLV(body.amount) : body.amount,
      ...(body.asset && body.asset !== 'KLV' ? { kda: body.asset } : {}),
    })
    await wallet.disconnect(true)
    sendJson(res, { hash: result.hash, status: result.status })
  } catch (e) {
    next(e)
  }
})

// Centralized error handler.
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction): void => {
  console.error('[error]', err instanceof Error ? err.stack : err)
  sendJson(
    res,
    { error: err instanceof Error ? err.message : 'internal error' },
    500,
  )
})

const server = app.listen(PORT, () => {
  console.log(`Klever REST server listening on http://localhost:${PORT} (${NETWORK})`)
  console.log('Endpoints:')
  console.log('  GET  /health')
  console.log('  GET  /balance?address=…&asset=…')
  console.log('  GET  /account?address=…')
  console.log('  GET  /tx/:hash')
  console.log('  POST /transfer  { to, amount, asset? }')
})

// Graceful shutdown.
function shutdown(sig: string): void {
  console.log(`Received ${sig}. Closing HTTP server...`)
  server.close((err) => {
    if (err) {
      console.error('close error:', err)
      process.exit(1)
    }
    console.log('HTTP server closed.')
    process.exit(0)
  })
  // Hard-exit if shutdown stalls.
  setTimeout(() => {
    console.warn('Forcing exit after 10s timeout.')
    process.exit(1)
  }, 10_000).unref()
}
process.on('SIGINT', () => shutdown('SIGINT'))
process.on('SIGTERM', () => shutdown('SIGTERM'))
