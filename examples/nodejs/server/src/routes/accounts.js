/**
 * Account routes
 *
 * GET /accounts/:address        - Full account info
 * GET /accounts/:address/balance - KLV balance
 */

import { Router } from 'express'
import { formatKLV, isValidAddress } from '@klever/connect'

export function createAccountRoutes(provider) {
  const router = Router()

  // Validate address middleware
  router.param('address', (req, res, next, address) => {
    if (!isValidAddress(address)) {
      return res.status(400).json({ error: `Invalid address: ${address}` })
    }
    next()
  })

  // GET /accounts/:address
  router.get('/:address', async (req, res, next) => {
    try {
      const account = await provider.getAccount(req.params.address)

      // Serialize assets — BigInt values must be converted to strings
      const assets = {}
      for (const asset of account.assets ?? []) {
        assets[asset.assetId] = {
          ...asset,
          balance: asset.balance?.toString(),
          frozenBalance: asset.frozenBalance?.toString(),
          unfrozenBalance: asset.unfrozenBalance?.toString(),
        }
      }

      res.json({
        address: req.params.address,
        nonce: account.nonce,
        balance: account.balance.toString(),
        balanceFormatted: formatKLV(account.balance),
        assets,
      })
    } catch (err) {
      next(err)
    }
  })

  // GET /accounts/:address/balance
  router.get('/:address/balance', async (req, res, next) => {
    try {
      const assetId = typeof req.query.asset === 'string' ? req.query.asset : undefined
      const balance = await provider.getBalance(req.params.address, assetId)
      res.json({
        address: req.params.address,
        asset: assetId ?? 'KLV',
        balance: balance.toString(),
        formatted: assetId ? balance.toString() : formatKLV(balance),
      })
    } catch (err) {
      next(err)
    }
  })

  return router
}
