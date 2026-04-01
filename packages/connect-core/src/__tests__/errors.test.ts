import { describe, it, expect } from 'vitest'
import {
  KleverError,
  ValidationError,
  NetworkError,
  WalletError,
  TransactionError,
  ContractError,
  EncodingError,
  CryptoError,
} from '../errors'

describe('KleverError', () => {
  it('should create error with message and code', () => {
    const err = new KleverError('test error', 'TEST_CODE')
    expect(err.message).toBe('test error')
    expect(err.code).toBe('TEST_CODE')
    expect(err.name).toBe('KleverError')
    expect(err instanceof Error).toBe(true)
    expect(err instanceof KleverError).toBe(true)
  })

  it('should store optional details', () => {
    const details = { field: 'address', value: 'invalid' }
    const err = new KleverError('error', 'CODE', details)
    expect(err.details).toEqual(details)
  })

  it('should have undefined details when not provided', () => {
    const err = new KleverError('error', 'CODE')
    expect(err.details).toBeUndefined()
  })
})

describe('ValidationError', () => {
  it('should create validation error', () => {
    const err = new ValidationError('invalid address')
    expect(err.message).toBe('invalid address')
    expect(err instanceof KleverError).toBe(true)
    expect(err instanceof ValidationError).toBe(true)
  })

  it('should accept optional details', () => {
    const err = new ValidationError('invalid', { address: 'bad' })
    expect(err.details).toEqual({ address: 'bad' })
  })
})

describe('NetworkError', () => {
  it('should create network error', () => {
    const err = new NetworkError('connection failed')
    expect(err.message).toBe('connection failed')
    expect(err instanceof KleverError).toBe(true)
    expect(err instanceof NetworkError).toBe(true)
  })
})

describe('WalletError', () => {
  it('should create wallet error', () => {
    const err = new WalletError('wallet not connected')
    expect(err.message).toBe('wallet not connected')
    expect(err instanceof KleverError).toBe(true)
    expect(err instanceof WalletError).toBe(true)
  })
})

describe('TransactionError', () => {
  it('should create transaction error', () => {
    const err = new TransactionError('tx failed')
    expect(err.message).toBe('tx failed')
    expect(err instanceof KleverError).toBe(true)
    expect(err instanceof TransactionError).toBe(true)
    expect(err.name).toBe('TransactionError')
  })

  it('should accept optional details', () => {
    const err = new TransactionError('tx failed', { txHash: 'abc123' })
    expect(err.details).toEqual({ txHash: 'abc123' })
  })
})

describe('ContractError', () => {
  it('should create contract error', () => {
    const err = new ContractError('contract execution failed')
    expect(err.message).toBe('contract execution failed')
    expect(err instanceof KleverError).toBe(true)
    expect(err instanceof ContractError).toBe(true)
    expect(err.name).toBe('ContractError')
  })
})

describe('EncodingError', () => {
  it('should create encoding error', () => {
    const err = new EncodingError('invalid encoding')
    expect(err.message).toBe('invalid encoding')
    expect(err instanceof KleverError).toBe(true)
    expect(err instanceof EncodingError).toBe(true)
    expect(err.name).toBe('EncodingError')
  })
})

describe('CryptoError', () => {
  it('should create crypto error', () => {
    const err = new CryptoError('invalid key')
    expect(err.message).toBe('invalid key')
    expect(err instanceof KleverError).toBe(true)
    expect(err instanceof CryptoError).toBe(true)
    expect(err.name).toBe('CryptoError')
  })
})
