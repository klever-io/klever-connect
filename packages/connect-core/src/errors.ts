export class KleverError extends Error {
  public readonly code: string
  public readonly details?: unknown

  constructor(message: string, code: string, details?: unknown) {
    super(message)
    this.name = 'KleverError'
    this.code = code
    this.details = details
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

export class ValidationError extends KleverError {
  constructor(message: string, details?: unknown) {
    super(message, 'VALIDATION_ERROR', details)
    this.name = 'ValidationError'
  }
}

export class NetworkError extends KleverError {
  constructor(message: string, details?: unknown) {
    super(message, 'NETWORK_ERROR', details)
    this.name = 'NetworkError'
  }
}

export class TransactionError extends KleverError {
  constructor(message: string, details?: unknown) {
    super(message, 'TRANSACTION_ERROR', details)
    this.name = 'TransactionError'
  }
}

export class ContractError extends KleverError {
  constructor(message: string, details?: unknown) {
    super(message, 'CONTRACT_ERROR', details)
    this.name = 'ContractError'
  }
}

export class WalletError extends KleverError {
  constructor(message: string, details?: unknown) {
    super(message, 'WALLET_ERROR', details)
    this.name = 'WalletError'
  }
}

export class EncodingError extends KleverError {
  constructor(message: string, details?: unknown) {
    super(message, 'ENCODING_ERROR', details)
    this.name = 'EncodingError'
  }
}

export class CryptoError extends KleverError {
  constructor(message: string, details?: unknown) {
    super(message, 'CRYPTO_ERROR', details)
    this.name = 'CryptoError'
  }
}
