# @klever/connect-core

Core types, constants, utilities, and error handling for the Klever Connect SDK.

## Installation

```bash
npm install @klever/connect-core
# or
pnpm add @klever/connect-core
# or
yarn add @klever/connect-core
```

## Overview

This package provides the foundational building blocks used across the Klever Connect SDK:

- **Branded Types** - Type-safe value handling with compile-time guarantees
- **Constants** - Blockchain parameters (asset IDs, precision, limits, timeouts)
- **Format Utilities** - Parse and format amounts between human-readable and smallest units
- **Error Classes** - Standardized error handling with context and recovery suggestions
- **Logger System** - Lightweight, configurable logging with multiple levels
- **Environment Detection** - Runtime environment identification (browser, Node.js, React Native)
- **Validation Functions** - Address validation and type guards
- **Network Types** - Network configuration and endpoint definitions

## Quick Start

### Format and Parse Amounts

```typescript
import { parseKLV, formatKLV, parseUnits, formatUnits } from '@klever/connect-core'

// Parse user input to blockchain units
const amount = parseKLV('1.5') // 1500000n (1.5 KLV in smallest units)

// Format blockchain units for display
const display = formatKLV(1500000n) // '1.5'

// Generic parsing with custom decimals
const customAmount = parseUnits('100', 18) // 100000000000000000000n
const customDisplay = formatUnits(100000000000000000000n, 18) // '100'
```

### Validate Addresses

```typescript
import { isKleverAddress, isValidAddress, createKleverAddress } from '@klever/connect-core'

// Quick regex-based validation
if (isKleverAddress(address)) {
  console.log('Valid format')
}

// Full bech32 validation
if (isValidAddress(address)) {
  console.log('Valid Klever address')
}

// Create validated address
const validatedAddress = createKleverAddress('klv1qqqqqqqqqqqqqpgq...')
```

### Use Branded Types

```typescript
import { KleverAddress, AssetAmount, createAssetAmount } from '@klever/connect-core'

// Type-safe function signatures
function transfer(to: KleverAddress, amount: AssetAmount) {
  // TypeScript ensures only validated addresses and amounts are passed
}

// Create typed values
const recipient = createKleverAddress('klv1abc...')
const amount = createAssetAmount(1000000n)

transfer(recipient, amount)
```

## API Reference

### Format Utilities

#### `parseKLV(amount: string | number): bigint`

Parse KLV amount from human-readable string to smallest units.

**Parameters:**

- `amount` - Human-readable KLV amount (e.g., `'1.5'` or `1.5`)

**Returns:** Amount in smallest units (6 decimals) as bigint

**Throws:** Error if amount has invalid format or too many decimals

**Example:**

```typescript
parseKLV('1') // 1000000n (1 KLV)
parseKLV('1.5') // 1500000n (1.5 KLV)
parseKLV(2) // 2000000n (2 KLV)
parseKLV('0.000001') // 1n (smallest KLV unit)
```

#### `formatKLV(amount: bigint | string | number): string`

Format KLV amount from smallest units to human-readable string.

**Parameters:**

- `amount` - Amount in smallest units

**Returns:** Formatted KLV string

**Example:**

```typescript
formatKLV(1000000n) // '1'
formatKLV(1500000n) // '1.5'
formatKLV('2000000') // '2'
```

#### `parseUnits(value: string | number, decimals?: number): bigint`

Parse a human-readable string to its smallest unit with custom decimals.

**Parameters:**

- `value` - The string or number value (e.g., `'1.5'` or `1.5`)
- `decimals` - Number of decimals (default: `6`)

**Returns:** Value in smallest units as bigint

**Throws:** Error if value has invalid decimal format or too many decimal places

**Example:**

```typescript
parseUnits('1') // 1000000n (6 decimals default)
parseUnits('1.5') // 1500000n
parseUnits('0.000001') // 1n
parseUnits('100', 3) // 100000n (with 3 decimals)

// Error cases
parseUnits('1.1234567', 6) // Error: Too many decimal places (max 6)
parseUnits('1.2.3') // Error: Invalid decimal value
```

#### `formatUnits(value: bigint | string | number, decimals?: number): string`

Format a value from its smallest unit to a human-readable string.

**Parameters:**

- `value` - The value in smallest units
- `decimals` - Number of decimals (default: `6`)

**Returns:** Formatted string representation

**Example:**

```typescript
formatUnits(1000000n) // '1'
formatUnits(1500000n) // '1.5'
formatUnits(1234567n) // '1.234567'
formatUnits(500n) // '0.0005'
formatUnits('2000000', 6) // '2'
formatUnits(1000, 3) // '1' (with 3 decimals)
```

### Branded Types

Branded types provide compile-time type safety without runtime overhead.

#### `KleverAddress`

A validated Klever address (must start with `klv1` and be 62 characters long).

```typescript
import type { KleverAddress } from '@klever/connect-core'

const address: KleverAddress = createKleverAddress('klv1qqqqqqqqqqqqqpgq...')
```

#### `TransactionHash`

A validated transaction hash (64 hexadecimal characters).

```typescript
import type { TransactionHash } from '@klever/connect-core'

const hash: TransactionHash = createTransactionHash('1234567890abcdef...')
```

#### `AssetAmount`

An asset amount in smallest units.

```typescript
import type { AssetAmount } from '@klever/connect-core'

const amount: AssetAmount = createAssetAmount(1000000n)
```

#### Other Branded Types

```typescript
import type {
  AssetID,
  BlockHeight,
  BlockHash,
  Nonce,
  PublicKey,
  PrivateKey,
  Signature,
  HexString,
  Base58String,
} from '@klever/connect-core'
```

### Type Guards and Validators

#### `isKleverAddress(value: string): value is KleverAddress`

Quick regex-based validation of Klever address format.

**Example:**

```typescript
if (isKleverAddress(input)) {
  // input is now typed as KleverAddress
  console.log('Valid address format')
}
```

#### `isValidAddress(address: string): boolean`

Full bech32 validation with prefix and data length checks.

**Example:**

```typescript
if (isValidAddress('klv1qqqqqqqqqqqqqpgq...')) {
  console.log('Valid Klever address')
}
```

#### `isTransactionHash(value: string): value is TransactionHash`

Validates transaction hash format (64 hex characters).

**Example:**

```typescript
if (isTransactionHash(input)) {
  // input is now typed as TransactionHash
  console.log('Valid transaction hash')
}
```

### Branded Type Creators

#### `createKleverAddress(value: string): KleverAddress`

Creates a validated KleverAddress.

**Throws:** Error if address is invalid

**Example:**

```typescript
const address = createKleverAddress('klv1qqqqqqqqqqqqqpgq...')
```

#### `createTransactionHash(value: string): TransactionHash`

Creates a validated TransactionHash.

**Throws:** Error if hash is invalid

**Example:**

```typescript
const hash = createTransactionHash('1234567890abcdef...')
```

#### `createAssetAmount(value: bigint | string | number, decimals?: number): AssetAmount`

Creates a validated AssetAmount.

**Throws:** Error if amount is negative

**Example:**

```typescript
const amount1 = createAssetAmount(1000000n) // From bigint
const amount2 = createAssetAmount('1000000') // From string
const amount3 = createAssetAmount(1000000) // From number
```

#### `formatAssetAmount(amount: AssetAmount, decimals?: number): string`

Formats an AssetAmount to human-readable string.

**Example:**

```typescript
formatAssetAmount(createAssetAmount(1000000n)) // '1'
formatAssetAmount(createAssetAmount(1500000n)) // '1.5'
```

#### `parseAssetAmount(value: string, decimals?: number): AssetAmount`

Parses a string to AssetAmount.

**Example:**

```typescript
parseAssetAmount('1') // 1000000n as AssetAmount
parseAssetAmount('1.5') // 1500000n as AssetAmount
```

### Constants

All constants are exported and documented for easy reference.

#### Asset Constants

```typescript
import {
  KLV_ASSET_ID, // 'KLV'
  KFI_ASSET_ID, // 'KFI'
  KLV_PRECISION, // 6
  KFI_PRECISION, // 6
  KLV_MULTIPLIER, // 1000000
  KFI_MULTIPLIER, // 1000000
  KLV_NAME, // 'Klever'
  KFI_NAME, // 'Klever Finance'
  COMMON_ASSETS, // { KLV: {...}, KFI: {...} }
} from '@klever/connect-core'
```

#### Address Constants

```typescript
import {
  ADDRESS_PREFIX, // 'klv'
  ADDRESS_LENGTH, // 62
} from '@klever/connect-core'
```

#### Transaction Constants

```typescript
import {
  BASE_TX_SIZE, // 250 bytes
  MAX_MESSAGE_SIZE, // 102400 bytes (100 KB)
  SIGNATURE_LENGTH, // 64 bytes
  MAX_TX_SIZE, // 32768 bytes (32 KB)
} from '@klever/connect-core'
```

#### Staking Constants

```typescript
import {
  MIN_SELF_DELEGATION, // 1000000000000n (1M KLV)
  UNBONDING_TIME, // 1814400 seconds (21 days)
  MAX_DELEGATORS_PER_VALIDATOR, // 10000
} from '@klever/connect-core'
```

#### Block Constants

```typescript
import {
  BLOCK_TIME, // 4 seconds
  BLOCKS_PER_EPOCH, // 5400 blocks (~6 hours)
  BLOCKS_PER_YEAR, // 7884000 blocks
  EPOCH_DURATION, // 21600 seconds (6 hours)
} from '@klever/connect-core'
```

#### API Constants

```typescript
import {
  DEFAULT_PAGE_SIZE, // 100
  MAX_PAGE_SIZE, // 1000
  DEFAULT_TIMEOUT, // 30000 ms (30 seconds)
  DEFAULT_CONFIRMATIONS, // 1
} from '@klever/connect-core'
```

#### WebSocket Constants

```typescript
import {
  WS_RECONNECT_DELAY, // 1000 ms
  WS_MAX_RECONNECT_ATTEMPTS, // 5
  WS_PING_INTERVAL, // 30000 ms (30 seconds)
} from '@klever/connect-core'
```

### Error Classes

All error classes extend `BaseError` with standardized structure and context.

#### `NetworkError`

Thrown when network requests fail.

```typescript
import { NetworkError } from '@klever/connect-core'

try {
  await fetch(url)
} catch (error) {
  throw new NetworkError('Failed to connect to node', { url, statusCode: 500 })
}
```

#### `TransactionError`

Thrown when transaction operations fail.

```typescript
import { TransactionError } from '@klever/connect-core'

if (!tx.isValid()) {
  throw new TransactionError('Transaction validation failed', { txHash: tx.hash })
}
```

#### `WalletError`

Thrown when wallet operations fail.

```typescript
import { WalletError } from '@klever/connect-core'

if (!wallet.isConnected()) {
  throw new WalletError('Wallet not connected', { walletType: 'klever' })
}
```

#### `ValidationError`

Thrown when input validation fails.

```typescript
import { ValidationError } from '@klever/connect-core'

if (!isValidAddress(address)) {
  throw new ValidationError(`Invalid address: ${address}`, {
    address,
    expected: 'klv1...',
  })
}
```

#### `ContractError`

Thrown when smart contract operations fail.

```typescript
import { ContractError } from '@klever/connect-core'

const result = await contract.call('transfer', [to, amount])
if (!result.success) {
  throw new ContractError('Contract call failed', {
    contract: address,
    method: 'transfer',
  })
}
```

#### `AuthenticationError`

Thrown when authentication fails.

```typescript
import { AuthenticationError } from '@klever/connect-core'

if (!isValidSignature(signature, message, publicKey)) {
  throw new AuthenticationError('Invalid signature', { publicKey })
}
```

#### `RetryableError`

Error that can be retried with exponential backoff.

```typescript
import { RetryableError } from '@klever/connect-core'

throw new RetryableError(
  'Service temporarily unavailable',
  ErrorCode.NetworkUnavailable,
  { service: 'node' },
  { retryAfter: 5000, maxRetries: 3 },
)
```

#### `RecoverableError`

Error with recovery suggestions for users.

```typescript
import { RecoverableError } from '@klever/connect-core'

throw new RecoverableError(
  'Insufficient balance',
  ErrorCode.InvalidAmount,
  ['Top up your account', 'Use a smaller amount'],
  { balance: '100', required: '1000' },
)
```

#### `AggregateError`

Combines multiple errors into one.

```typescript
import { AggregateError } from '@klever/connect-core'

const errors = await Promise.allSettled(operations)
const failures = errors.filter((r) => r.status === 'rejected').map((r) => r.reason)
if (failures.length > 0) {
  throw new AggregateError(failures, 'Multiple operations failed')
}
```

#### Error Boundary Helper

```typescript
import { errorBoundary } from '@klever/connect-core'

const result = await errorBoundary(async () => await riskyOperation(), {
  fallback: defaultValue,
  onError: (error) => console.error('Operation failed:', error),
  transform: (error) => new CustomError('Wrapped error', { cause: error }),
})
```

### Logger System

Lightweight logging with configurable levels and output.

#### `createLogger(module: string, options?: LoggerOptions): Logger`

Creates a logger instance for a specific module.

**Parameters:**

- `module` - Module name to prefix log messages
- `options` - Optional logger configuration
  - `level` - Minimum log level (`'debug'`, `'info'`, `'warn'`, `'error'`, `'silent'`)
  - `timestamp` - Include timestamp in logs (default: `true`)
  - `prefix` - Include module prefix (default: `true`)
  - `colors` - Enable color output (default: `true` in TTY)
  - `handler` - Custom log handler

**Returns:** Logger instance with `debug`, `info`, `warn`, `error`, `child`, and `setLevel` methods

**Example:**

```typescript
import { createLogger } from '@klever/connect-core'

const logger = createLogger('MyModule', {
  level: 'debug',
  timestamp: true,
  colors: true,
})

logger.debug('Detailed debug info')
logger.info('Operation started')
logger.warn('Low memory warning')
logger.error('Operation failed', error)

// Create child logger
const childLogger = logger.child('SubModule')
childLogger.info('Message from MyModule:SubModule')

// Change log level dynamically
logger.setLevel('warn')
```

#### `getGlobalLogger(module: string): Logger`

Creates a logger using global configuration (recommended).

**Example:**

```typescript
import { getGlobalLogger } from '@klever/connect-core'

const logger = getGlobalLogger('MyModule')
logger.info('Module initialized')
```

#### `setGlobalLoggerOptions(options: Partial<LoggerOptions>): void`

Sets global logger options for all loggers created via `getGlobalLogger()`.

**Example:**

```typescript
import { setGlobalLoggerOptions } from '@klever/connect-core'

// Set global log level
setGlobalLoggerOptions({ level: 'debug' })

// Disable timestamps and colors
setGlobalLoggerOptions({
  timestamp: false,
  colors: false,
})
```

#### `initBrowserLogger(options?: Partial<LoggerOptions>): void`

Initialize logger configuration from browser environment.

**Example:**

```typescript
import { initBrowserLogger } from '@klever/connect-core'

// In your browser app initialization
initBrowserLogger({
  level: 'debug',
  timestamp: false,
  colors: false,
})

// Or load from window.__env__
window.__env__ = { KLEVER_LOG_LEVEL: 'debug' }
initBrowserLogger()
```

#### Pre-configured Loggers

```typescript
import {
  coreLogger, // For core SDK operations
  providerLogger, // For provider/network operations
  walletLogger, // For wallet operations
  transactionLogger, // For transaction operations
  contractLogger, // For smart contract operations
} from '@klever/connect-core'

coreLogger.info('SDK initialized')
providerLogger.debug('Fetching account balance')
walletLogger.info('Signing transaction')
transactionLogger.debug('Building transfer transaction')
contractLogger.info('Invoking contract method', { method: 'transfer' })
```

### Environment Detection

#### `detectEnvironment(): Environment`

Detects the current JavaScript runtime environment.

**Returns:** `'browser'`, `'node'`, `'react-native'`, or `'unknown'`

**Example:**

```typescript
import { detectEnvironment } from '@klever/connect-core'

const env = detectEnvironment()
if (env === 'browser') {
  // Use browser-specific APIs
} else if (env === 'node') {
  // Use Node.js-specific APIs
}
```

#### `isBrowser(): boolean`

Checks if running in a browser environment.

**Example:**

```typescript
import { isBrowser } from '@klever/connect-core'

if (isBrowser()) {
  window.localStorage.setItem('key', 'value')
}
```

#### `isNode(): boolean`

Checks if running in Node.js environment.

**Example:**

```typescript
import { isNode } from '@klever/connect-core'

if (isNode()) {
  const fs = require('fs')
}
```

#### `isReactNative(): boolean`

Checks if running in React Native environment.

**Example:**

```typescript
import { isReactNative } from '@klever/connect-core'

if (isReactNative()) {
  // Use React Native-specific modules
}
```

### Network Types

#### `Network` Interface

Complete network configuration with metadata.

```typescript
import type { Network } from '@klever/connect-core'

const mainnet: Network = {
  name: 'mainnet',
  chainId: 'klever-mainnet',
  config: {
    api: 'https://api.mainnet.klever.finance',
    node: 'https://node.mainnet.klever.finance',
  },
  isTestnet: false,
  nativeCurrency: {
    name: 'Klever',
    symbol: 'KLV',
    decimals: 6,
  },
}
```

#### `NetworkURI` Interface

Network endpoint URIs for different services.

```typescript
import type { NetworkURI } from '@klever/connect-core'

const uris: NetworkURI = {
  api: 'https://api.mainnet.klever.finance', // Indexer/Proxy API
  node: 'https://node.mainnet.klever.finance', // Direct node access
  ws: 'wss://ws.mainnet.klever.finance', // WebSocket endpoint
  explorer: 'https://kleverscan.org', // Block explorer
}
```

#### `NetworkConfig` Type

Flexible network configuration (string name, URI object, or full Network object).

```typescript
import type { NetworkConfig } from '@klever/connect-core'

// Predefined network name
const config1: NetworkConfig = 'mainnet'

// Custom URIs
const config2: NetworkConfig = {
  api: 'https://my-custom-api.com',
}

// Full network configuration
const config3: NetworkConfig = {
  name: 'custom',
  chainId: 'my-chain',
  config: { api: 'https://api.mychain.com' },
  isTestnet: true,
  nativeCurrency: { name: 'MyToken', symbol: 'MTK', decimals: 6 },
}
```

## Common Use Cases

### Example 1: Format Amounts for Display

```typescript
import { formatKLV, formatUnits } from '@klever/connect-core'

// Display KLV balance
function displayBalance(balance: bigint): string {
  return `${formatKLV(balance)} KLV`
}

console.log(displayBalance(1500000n)) // '1.5 KLV'

// Display custom token with 18 decimals
function displayTokenBalance(balance: bigint, symbol: string): string {
  return `${formatUnits(balance, 18)} ${symbol}`
}
```

### Example 2: Parse User Input

```typescript
import { parseKLV, ValidationError } from '@klever/connect-core'

function parseUserAmount(input: string): bigint {
  try {
    return parseKLV(input)
  } catch (error) {
    throw new ValidationError('Invalid amount format', {
      input,
      expected: 'Number with up to 6 decimals (e.g., 1.5)',
    })
  }
}

// Usage
const amount = parseUserAmount('1.5') // 1500000n
```

### Example 3: Validate and Create Typed Values

```typescript
import {
  isKleverAddress,
  createKleverAddress,
  createAssetAmount,
  ValidationError,
  type KleverAddress,
  type AssetAmount,
} from '@klever/connect-core'

function prepareTransfer(
  toAddress: string,
  amountStr: string,
): {
  to: KleverAddress
  amount: AssetAmount
} {
  // Validate address
  if (!isKleverAddress(toAddress)) {
    throw new ValidationError('Invalid recipient address', {
      address: toAddress,
    })
  }

  // Parse amount
  const amount = parseKLV(amountStr)
  if (amount <= 0n) {
    throw new ValidationError('Amount must be positive', {
      amount: amountStr,
    })
  }

  return {
    to: createKleverAddress(toAddress),
    amount: createAssetAmount(amount),
  }
}
```

### Example 4: Error Handling with Context

```typescript
import { NetworkError, errorBoundary } from '@klever/connect-core'

async function fetchWithRetry(url: string): Promise<Response> {
  return errorBoundary(
    async () => {
      const response = await fetch(url)
      if (!response.ok) {
        throw new NetworkError('HTTP request failed', {
          url,
          status: response.status,
          statusText: response.statusText,
        })
      }
      return response
    },
    {
      onError: (error) => {
        console.error('Fetch failed:', error)
      },
      transform: (error) => {
        if (error instanceof NetworkError) {
          return error
        }
        return new NetworkError('Unexpected error', { url }, error as Error)
      },
    },
  )
}
```

### Example 5: Logger Configuration

```typescript
import { createLogger, setGlobalLoggerOptions } from '@klever/connect-core'

// Configure global logging
setGlobalLoggerOptions({
  level: process.env.NODE_ENV === 'production' ? 'warn' : 'debug',
  timestamp: true,
  colors: true,
})

// Create module-specific logger
const logger = createLogger('TransactionBuilder')

logger.debug('Building transaction', { nonce: 1, sender: 'klv1...' })
logger.info('Transaction signed successfully')
logger.warn('Large transaction size detected', { size: 30000 })
logger.error('Failed to broadcast transaction', error)
```

## TypeScript Support

Fully typed with comprehensive TypeScript definitions for all exports.

```typescript
import type {
  // Branded types
  KleverAddress,
  TransactionHash,
  AssetAmount,
  AssetID,
  BlockHeight,
  BlockHash,
  Nonce,
  PublicKey,
  PrivateKey,
  Signature,
  HexString,
  Base58String,

  // Network types
  Network,
  NetworkURI,
  NetworkConfig,
  NetworkName,

  // Logger types
  Logger,
  LogLevel,
  LoggerOptions,
  LogHandler,

  // Error types
  ErrorContext,

  // Environment type
  Environment,
} from '@klever/connect-core'

// All types are inferred automatically
const amount = parseKLV('1.5') // bigint
const formatted = formatKLV(1000000n) // string
const isValid = isKleverAddress('klv1...') // boolean
```

## Related Packages

- `@klever/connect-transactions` - Transaction building (uses format utilities and types)
- `@klever/connect-provider` - Network communication (uses error classes and network types)
- `@klever/connect-wallet` - Wallet implementations (uses branded types and validation)
- `@klever/connect-contracts` - Smart contract interactions (uses error classes and logger)
- `@klever/connect-react` - React hooks (uses all core utilities)

## Contributing

See the main [Contributing Guide](../../CONTRIBUTING.md) for details.

## License

MIT
