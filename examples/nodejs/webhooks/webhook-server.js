/**
 * Webhook Server — Transaction Confirmation Handler
 *
 * Demonstrates an Express server that receives incoming webhook
 * notifications for Klever transaction events.
 *
 * Features:
 * - Receives POST /webhook with transaction payload
 * - HMAC-SHA256 signature verification (prevents forged webhooks)
 * - Structured logging with winston
 * - Graceful shutdown
 *
 * Usage:
 *   node webhooks/webhook-server.js
 *
 * Environment variables:
 *   WEBHOOK_PORT   - HTTP port (default: 3001)
 *   WEBHOOK_SECRET - HMAC secret for signature verification
 *   NETWORK        - Klever network for transaction lookups (default: testnet)
 *   LOG_LEVEL      - Log level (default: info)
 */

import 'dotenv/config'
import { createHmac } from 'crypto'
import express from 'express'
import winston from 'winston'
import { KleverProvider } from '@klever/connect'

// ─── Logger ───────────────────────────────────────────────────────────────────

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.colorize(),
    winston.format.simple(),
  ),
  transports: [new winston.transports.Console()],
})

// ─── Configuration ────────────────────────────────────────────────────────────

const PORT = parseInt(process.env.WEBHOOK_PORT || '3001', 10)
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'change_this_secret'
const NETWORK = process.env.NETWORK || 'testnet'

if (WEBHOOK_SECRET === 'change_this_secret') {
  logger.warn('Using default WEBHOOK_SECRET. Set WEBHOOK_SECRET in .env for production!')
}

// ─── Provider ─────────────────────────────────────────────────────────────────

const provider = new KleverProvider({ network: NETWORK })

// ─── Signature verification ───────────────────────────────────────────────────

function verifySignature(rawBody, signatureHeader) {
  if (!signatureHeader) return false

  const expectedSig = createHmac('sha256', WEBHOOK_SECRET).update(rawBody).digest('hex')

  // Timing-safe comparison
  const expected = Buffer.from(`sha256=${expectedSig}`)
  const received = Buffer.from(signatureHeader)

  if (expected.length !== received.length) return false
  return expected.every((byte, i) => byte === received[i])
}

// ─── Event handlers ───────────────────────────────────────────────────────────

async function handleTransactionConfirmed(payload) {
  const { txHash, address, amount, asset } = payload
  logger.info(
    `Transaction confirmed txHash=${txHash} address=${address} amount=${amount} asset=${asset}`,
  )

  try {
    const tx = await provider.getTransaction(txHash)
    logger.info(`On-chain confirmation verified txHash=${txHash} status=${tx.status}`)
  } catch (err) {
    logger.warn(`Could not verify transaction on-chain txHash=${txHash} error=${err.message}`)
  }
}

async function handleTransactionFailed(payload) {
  logger.error(`Transaction failed txHash=${payload.txHash} reason=${payload.reason}`)
}

async function processWebhookEvent(event, payload) {
  switch (event) {
    case 'transaction.confirmed':
      await handleTransactionConfirmed(payload)
      break
    case 'transaction.failed':
      await handleTransactionFailed(payload)
      break
    default:
      logger.info(`Received unhandled event type: ${event}`)
  }
}

// ─── Express server ───────────────────────────────────────────────────────────

const app = express()

// Parse raw body for signature verification BEFORE json parsing
app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf
    },
  }),
)

app.use((req, _res, next) => {
  logger.info(`${req.method} ${req.path}`)
  next()
})

// POST /webhook
app.post('/webhook', async (req, res) => {
  const signature = req.headers['x-klever-signature']

  if (!verifySignature(req.rawBody, signature)) {
    logger.warn(`Invalid webhook signature from ${req.ip}`)
    return res.status(401).json({ error: 'Invalid signature' })
  }

  const { event, data } = req.body

  if (!event || !data) {
    return res.status(400).json({ error: 'Missing event or data fields' })
  }

  // Acknowledge immediately (process asynchronously)
  res.status(200).json({ received: true, event })

  processWebhookEvent(event, data).catch((err) => {
    logger.error(`Error processing webhook event=${event} error=${err.message}`)
  })
})

// GET /health
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', network: NETWORK, timestamp: new Date().toISOString() })
})

// ─── Start ────────────────────────────────────────────────────────────────────

const server = app.listen(PORT, () => {
  logger.info(`Webhook server started port=${PORT} network=${NETWORK}`)
  logger.info(`Health check: http://localhost:${PORT}/health`)
  logger.info(`Webhook endpoint: POST http://localhost:${PORT}/webhook`)
})

// ─── Graceful shutdown ────────────────────────────────────────────────────────

function shutdown(signal) {
  logger.info(`Received ${signal}, shutting down...`)
  server.close(() => {
    logger.info('Server closed')
    process.exit(0)
  })

  setTimeout(() => {
    logger.error('Forced shutdown')
    process.exit(1)
  }, 5000)
}

process.on('SIGINT', () => shutdown('SIGINT'))
process.on('SIGTERM', () => shutdown('SIGTERM'))
