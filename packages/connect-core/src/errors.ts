/**
 * Base error class for all Klever SDK errors
 *
 * All custom errors in the SDK extend from this class, providing
 * a consistent interface with error codes and optional details.
 *
 * @example
 * ```typescript
 * try {
 *   // Some operation
 * } catch (error) {
 *   if (error instanceof KleverError) {
 *     console.error(`Error [${error.code}]: ${error.message}`)
 *     console.error('Details:', error.details)
 *   }
 * }
 * ```
 */
export class KleverError extends Error {
  /** Error code for categorizing the error */
  public readonly code: string
  /** Additional error details (can be any type) */
  public readonly details?: unknown

  /**
   * Creates a new KleverError instance
   *
   * @param message - Human-readable error description
   * @param code - Error code identifier
   * @param details - Optional additional error information
   */
  constructor(message: string, code: string, details?: unknown) {
    super(message)
    this.name = 'KleverError'
    this.code = code
    this.details = details
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

/**
 * Error thrown when input validation fails
 *
 * Used for invalid addresses, amounts, transaction parameters, etc.
 *
 * @example
 * ```typescript
 * if (!isValidAddress(address)) {
 *   throw new ValidationError('Invalid Klever address', { address })
 * }
 * ```
 */
export class ValidationError extends KleverError {
  /**
   * Creates a new ValidationError
   *
   * @param message - Description of what validation failed
   * @param details - Optional details about the invalid input
   */
  constructor(message: string, details?: unknown) {
    super(message, 'VALIDATION_ERROR', details)
    this.name = 'ValidationError'
  }
}

/**
 * Error thrown when network/RPC operations fail
 *
 * Used for connection failures, timeout errors, API errors, etc.
 *
 * @example
 * ```typescript
 * try {
 *   await provider.getBalance(address)
 * } catch (error) {
 *   if (error instanceof NetworkError) {
 *     console.error('Network request failed:', error.message)
 *   }
 * }
 * ```
 */
export class NetworkError extends KleverError {
  /**
   * Creates a new NetworkError
   *
   * @param message - Description of the network failure
   * @param details - Optional details (status code, response data, etc.)
   */
  constructor(message: string, details?: unknown) {
    super(message, 'NETWORK_ERROR', details)
    this.name = 'NetworkError'
  }
}

/**
 * Error thrown when transaction operations fail
 *
 * Used for transaction building, signing, broadcasting, or execution failures.
 *
 * @example
 * ```typescript
 * try {
 *   await signer.sendTransaction(txRequest)
 * } catch (error) {
 *   if (error instanceof TransactionError) {
 *     console.error('Transaction failed:', error.message)
 *     console.error('Details:', error.details)
 *   }
 * }
 * ```
 */
export class TransactionError extends KleverError {
  /**
   * Creates a new TransactionError
   *
   * @param message - Description of the transaction failure
   * @param details - Optional details (transaction data, blockchain response, etc.)
   */
  constructor(message: string, details?: unknown) {
    super(message, 'TRANSACTION_ERROR', details)
    this.name = 'TransactionError'
  }
}

/**
 * Error thrown when smart contract operations fail
 *
 * Used for contract deployment, invocation, or ABI-related errors.
 *
 * @example
 * ```typescript
 * try {
 *   await contract.invoke('transfer', [recipient, amount])
 * } catch (error) {
 *   if (error instanceof ContractError) {
 *     console.error('Contract call failed:', error.message)
 *   }
 * }
 * ```
 */
export class ContractError extends KleverError {
  /**
   * Creates a new ContractError
   *
   * @param message - Description of the contract operation failure
   * @param details - Optional details (method name, parameters, contract response, etc.)
   */
  constructor(message: string, details?: unknown) {
    super(message, 'CONTRACT_ERROR', details)
    this.name = 'ContractError'
  }
}

/**
 * Error thrown when wallet operations fail
 *
 * Used for key management, signing, or wallet-related errors.
 *
 * @example
 * ```typescript
 * try {
 *   const wallet = new Wallet(privateKey)
 * } catch (error) {
 *   if (error instanceof WalletError) {
 *     console.error('Wallet initialization failed:', error.message)
 *   }
 * }
 * ```
 */
export class WalletError extends KleverError {
  /**
   * Creates a new WalletError
   *
   * @param message - Description of the wallet operation failure
   * @param details - Optional details about the failure
   */
  constructor(message: string, details?: unknown) {
    super(message, 'WALLET_ERROR', details)
    this.name = 'WalletError'
  }
}

/**
 * Error thrown when encoding/decoding operations fail
 *
 * Used for proto encoding/decoding, bech32, hex, or other format conversions.
 *
 * @example
 * ```typescript
 * try {
 *   const decoded = bech32Decode(address)
 * } catch (error) {
 *   if (error instanceof EncodingError) {
 *     console.error('Failed to decode address:', error.message)
 *   }
 * }
 * ```
 */
export class EncodingError extends KleverError {
  /**
   * Creates a new EncodingError
   *
   * @param message - Description of the encoding/decoding failure
   * @param details - Optional details (input data, expected format, etc.)
   */
  constructor(message: string, details?: unknown) {
    super(message, 'ENCODING_ERROR', details)
    this.name = 'EncodingError'
  }
}

/**
 * Error thrown when cryptographic operations fail
 *
 * Used for signing, verification, hashing, or other crypto operations.
 *
 * @example
 * ```typescript
 * try {
 *   const signature = await wallet.signMessage(message)
 * } catch (error) {
 *   if (error instanceof CryptoError) {
 *     console.error('Signing failed:', error.message)
 *   }
 * }
 * ```
 */
export class CryptoError extends KleverError {
  /**
   * Creates a new CryptoError
   *
   * @param message - Description of the cryptographic operation failure
   * @param details - Optional details about the failure
   */
  constructor(message: string, details?: unknown) {
    super(message, 'CRYPTO_ERROR', details)
    this.name = 'CryptoError'
  }
}
