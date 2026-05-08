/**
 * Klever Connect - Express REST API Server
 *
 * Demonstrates how to integrate the Klever Connect SDK into an Express
 * HTTP server for building blockchain-backed APIs.
 *
 * Features:
 * - POST /transactions/transfer  - Submit a transfer transaction
 * - GET  /accounts/:address      - Get account information
 * - GET  /accounts/:address/balance - Get KLV balance
 * - GET  /transactions/:hash     - Get transaction by hash
 * - GET  /health                 - Health check endpoint
 *
 * Usage:
 *   node server/src/server.js
 *
 * Environment variables:
 *   PORT        - HTTP port (default: 3000)
 *   HOST        - Bind host (default: 0.0.0.0)
 *   NETWORK     - Klever network (default: testnet)
 *   PRIVATE_KEY - Signing key for outbound transactions
 */

import 'dotenv/config'
import express from 'express'
import { KleverProvider, NodeWallet, formatKLV, parseKLV, isValidAddress } from '@klever/connect'
import { createRoutes } from './routes/index.js'

const PORT = parseInt(process.env.PORT || '3000', 10)
const HOST = process.env.HOST || '0.0.0.0'
const NETWORK = process.env.NETWORK || 'testnet'

// ─── Provider & Wallet setup ──────────────────────────────────────────────────

const provider = new KleverProvider({
  network: NETWORK,
  retry: { maxRetries: 3, backoff: 'exponential' },
  cache: { ttl: 10000, maxSize: 50 },
})

let wallet = null
if (process.env.PRIVATE_KEY) {
  wallet = new NodeWallet(provider, process.env.PRIVATE_KEY)
  await wallet.connect()
  console.log(`Wallet loaded: ${wallet.address}`)
}

// ─── Express app ─────────────────────────────────────────────────────────────

const app = express()
app.use(express.json())

// Request logging middleware
app.use((req, _res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`)
  next()
})

// ─── Health check ─────────────────────────────────────────────────────────────

app.get('/health', async (_req, res) => {
  try {
    const blockNumber = await provider.getBlockNumber()
    res.json({
      status: 'ok',
      network: NETWORK,
      blockNumber: blockNumber.toString(),
      walletLoaded: wallet !== null,
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    res.status(503).json({
      status: 'degraded',
      error: err.message,
    })
  }
})

// ─── Routes ───────────────────────────────────────────────────────────────────

app.use('/', createRoutes(provider, wallet))

// ─── Error handling ───────────────────────────────────────────────────────────

app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err.message)
  res.status(500).json({
    error: 'Internal server error',
    message: err.message,
  })
})

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' })
})

// ─── Start server ─────────────────────────────────────────────────────────────

const server = app.listen(PORT, HOST, () => {
  console.log(`Klever API server running on http://${HOST}:${PORT}`)
  console.log(`Network: ${NETWORK}`)
  console.log(`Health check: http://localhost:${PORT}/health`)
})

// ─── Graceful shutdown ────────────────────────────────────────────────────────

async function shutdown(signal) {
  console.log(`\nReceived ${signal}. Shutting down gracefully...`)

  if (wallet) {
    await wallet.disconnect(true)
    console.log('Wallet disconnected')
  }

  server.close(() => {
    console.log('HTTP server closed')
    process.exit(0)
  })

  // Force exit after 10 seconds
  setTimeout(() => {
    console.error('Forced shutdown after timeout')
    process.exit(1)
  }, 10000)
}

process.on('SIGINT', () => shutdown('SIGINT'))
process.on('SIGTERM', () => shutdown('SIGTERM'))
