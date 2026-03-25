/**
 * Route definitions for the Klever Connect Express server
 */

import { Router } from 'express'
import { createAccountRoutes } from './accounts.js'
import { createTransactionRoutes } from './transactions.js'

export function createRoutes(provider, wallet) {
  const router = Router()

  router.use('/accounts', createAccountRoutes(provider))
  router.use('/transactions', createTransactionRoutes(provider, wallet))

  return router
}
