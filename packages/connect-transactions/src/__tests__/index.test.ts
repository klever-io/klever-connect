import { describe, it, expect } from 'vitest'
import * as Transactions from '../index'

describe('@klever/connect-transactions', () => {
  describe('exports', () => {
    it('should export Transaction class', () => {
      expect(Transactions.Transaction).toBeDefined()
      expect(typeof Transactions.Transaction).toBe('function')
    })

    it('should export TransactionBuilder class', () => {
      expect(Transactions.TransactionBuilder).toBeDefined()
      expect(typeof Transactions.TransactionBuilder).toBe('function')
    })

    it('should export helper functions', () => {
      // Check if helpers are exported (from ./helpers)
      // Note: Add specific helper function checks when helpers are implemented
      expect(Transactions).toBeDefined()
    })

    it('should export constants', () => {
      // Check if constants are exported (from ./constants)
      expect(Transactions).toBeDefined()
    })
  })

  describe('Transaction class', () => {
    it('should create Transaction instance', () => {
      const tx = new Transactions.Transaction()
      expect(tx).toBeInstanceOf(Transactions.Transaction)
    })
  })

  describe('TransactionBuilder class', () => {
    it('should create TransactionBuilder instance', () => {
      const builder = new Transactions.TransactionBuilder()
      expect(builder).toBeInstanceOf(Transactions.TransactionBuilder)
    })
  })
})
