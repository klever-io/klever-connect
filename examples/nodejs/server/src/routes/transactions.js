/**
 * Transaction routes
 *
 * POST /transactions/transfer   - Submit a transfer transaction
 * GET  /transactions/:hash      - Get transaction by hash
 */

import { Router } from 'express'
import { isValidAddress, parseKLV } from '@klever/connect'

export function createTransactionRoutes(provider, wallet) {
  const router = Router()

  // POST /transactions/transfer
  // Body: { receiver: string, amount: string, asset?: string }
  router.post('/transfer', async (req, res, next) => {
    if (!wallet) {
      return res.status(503).json({
        error: 'No wallet configured. Set PRIVATE_KEY environment variable.',
      })
    }

    const { receiver, amount, asset } = req.body

    if (!receiver || !isValidAddress(receiver)) {
      return res.status(400).json({ error: 'Invalid or missing receiver address' })
    }
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return res.status(400).json({ error: 'Invalid or missing amount' })
    }

    try {
      const result = await wallet.transfer({
        receiver,
        amount: parseKLV(amount),
        ...(asset ? { kda: asset } : {}),
      })

      res.status(201).json({
        hash: result.hash,
        status: result.status,
        explorerUrl: provider.getTransactionUrl(result.hash),
      })
    } catch (err) {
      next(err)
    }
  })

  // GET /transactions/:hash
  router.get('/:hash', async (req, res, next) => {
    try {
      const tx = await provider.getTransaction(req.params.hash)
      res.json(tx)
    } catch (err) {
      next(err)
    }
  })

  return router
}
