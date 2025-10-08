# @klever/connect-provider

Network provider for Klever Connect SDK - handles all blockchain interactions.

## Overview

`@klever/connect-provider` is the network layer of the Klever Connect SDK. It provides a comprehensive interface for interacting with the Klever blockchain, similar to ethers.js providers or web3.js providers.

**Key Features:**

- Multiple network support (mainnet, testnet, devnet, custom)
- Built-in request caching with configurable TTL
- Automatic retry logic with exponential backoff
- Transaction monitoring with confirmation tracking
- Type-safe receipt parsing for all transaction types
- Batch request optimization
- Smart contract querying
- Testnet faucet integration

## Installation

```bash
npm install @klever/connect-provider
```

## Quick Start

### Basic Usage

```typescript
import { KleverProvider } from '@klever/connect-provider'

// Connect to mainnet (default)
const provider = new KleverProvider()

// Get account balance
const balance = await provider.getBalance('klv1...')
console.log(`Balance: ${balance}`) // bigint

// Get account details
const account = await provider.getAccount('klv1...')
console.log(`Nonce: ${account.nonce}`)
console.log(`Assets: ${account.assets?.length}`)

// Get current block number
const blockNumber = await provider.getBlockNumber()
console.log(`Current block: ${blockNumber}`)
```

### Network Configuration

```typescript
import { KleverProvider, NETWORKS } from '@klever/connect-provider'

// Using named networks
const mainnet = new KleverProvider('mainnet')
const testnet = new KleverProvider('testnet')
const devnet = new KleverProvider('devnet')

// Using network config object
const provider = new KleverProvider({ network: 'testnet' })

// Custom network
const custom = new KleverProvider({
  url: 'https://custom-node.example.com',
  chainId: '12345',
})
```

## Features

- Network configuration (mainnet/testnet/devnet/custom)
- Account queries (balance, nonce, assets)
- Transaction broadcasting and monitoring
- Block queries with multiple identifiers
- Built-in caching with LRU eviction
- Automatic retry with exponential backoff
- Type-safe receipt parsing
- Smart contract queries
- Batch request optimization

## API

### `new KleverProvider(config?)`

Create a new provider instance.

**Parameters:**

- `config.network` - Network configuration (default: mainnet)
- `config.cacheOptions` - Cache configuration

### Methods

#### Account & Balance

- `getBalance(address: Address): Promise<bigint>` - Get KLV balance
- `getAccount(address: Address): Promise<Account>` - Get account details
- `getAccountInfo(address: Address): Promise<Account>` - Alias for `getAccount()` (Solana-style naming)

#### Transaction Operations

- `sendRawTransaction(txHex: string): Promise<TransactionHash>` - Broadcast transaction
- `sendTransaction(tx: unknown): Promise<BroadcastResult>` - Alias for `broadcastTransaction()` (Web3-style naming)
- `getTransactionReceipt(hash: TransactionHash): Promise<Receipt[]>` - Get transaction receipts
- `waitForTransaction(hash, confirmations?, onProgress?): Promise<Transaction>` - Wait for transaction confirmation

#### Blockchain Queries

- `getBlock(height: number): Promise<Block>` - Get block by height

#### Convenience Methods

- `batch<T>(requests: (() => Promise<T>)[]): Promise<T[]>` - Execute multiple requests in parallel

## Common Use Cases

### Monitoring Transactions

Wait for transaction confirmation with progress tracking:

```typescript
import { KleverProvider } from '@klever/connect-provider'

const provider = new KleverProvider()

// Send transaction and wait for it to be mined
const txHash = await provider.sendRawTransaction(signedTx)

// Simple wait (default 1 confirmation)
const tx = await provider.waitForTransaction(txHash)
if (tx) {
  console.log(`Transaction confirmed in block ${tx.blockNum}`)
}

// Wait for multiple confirmations with progress updates
const confirmedTx = await provider.waitForTransaction(
  txHash,
  3, // Wait for 3 confirmations
  (status, data) => {
    switch (status) {
      case 'pending':
        console.log(`Waiting... attempt ${data.attempts}/${data.maxAttempts}`)
        break
      case 'confirming':
        console.log(`Confirming... ${data.confirmations}/${data.required} confirmations`)
        break
      case 'failed':
        console.error('Transaction failed!')
        break
      case 'timeout':
        console.warn('Transaction timeout - not found after 2 minutes')
        break
    }
  },
)

if (confirmedTx?.status === 'success') {
  console.log('Transaction successful!')
  console.log('Receipts:', confirmedTx.receipts)
}
```

### Batch Requests for Efficiency

Execute multiple independent requests in parallel:

```typescript
import { KleverProvider } from '@klever/connect-provider'

const provider = new KleverProvider()

// Fetch data for multiple addresses at once
const [account1, account2, balance1, balance2] = await provider.batch([
  () => provider.getAccount('klv1address1...'),
  () => provider.getAccount('klv1address2...'),
  () => provider.getBalance('klv1address1...', 'KLV'),
  () => provider.getBalance('klv1address2...', 'KDA-TOKEN'),
])

console.log('Account 1:', account1)
console.log('Account 2:', account2)
console.log('Balance 1:', balance1)
console.log('Balance 2:', balance2)

// Fetch multiple block details
const [latestBlock, block100, block200] = await provider.batch([
  () => provider.getBlock('latest'),
  () => provider.getBlock(100),
  () => provider.getBlock(200),
])
```

### Error Handling Patterns

Robust error handling for production applications:

```typescript
import {
  KleverProvider,
  NetworkError,
  ValidationError,
  TransactionError,
} from '@klever/connect-provider'

const provider = new KleverProvider('mainnet')

try {
  const account = await provider.getAccount('klv1...')
  console.log('Account balance:', account.balance)
} catch (error) {
  if (error instanceof ValidationError) {
    console.error('Invalid input:', error.message)
    console.error('Details:', error.context)
  } else if (error instanceof NetworkError) {
    console.error('Network error:', error.message)
    // Retry logic or fallback
  } else {
    console.error('Unexpected error:', error)
  }
}

// Transaction error handling
try {
  const txHash = await provider.sendRawTransaction(signedTx)
  const tx = await provider.waitForTransaction(txHash)

  if (!tx) {
    throw new Error('Transaction timeout')
  }

  if (tx.status === 'failed') {
    throw new TransactionError('Transaction failed on-chain', {
      hash: txHash,
      status: tx.status,
    })
  }

  console.log('Transaction successful:', txHash)
} catch (error) {
  if (error instanceof TransactionError) {
    console.error('TX Error:', error.message)
    console.error('Context:', error.context)
  } else {
    console.error('Broadcast failed:', error)
  }
}
```

### Network Switching

Switch between networks dynamically:

```typescript
import { KleverProvider, NETWORKS } from '@klever/connect-provider'

// Create providers for different networks
const providers = {
  mainnet: new KleverProvider('mainnet'),
  testnet: new KleverProvider('testnet'),
}

// Switch network based on environment
const currentNetwork = process.env.NODE_ENV === 'production' ? 'mainnet' : 'testnet'
const provider = providers[currentNetwork]

console.log('Using network:', provider.getNetworkName())
console.log('Chain ID:', provider.getNetwork().chainId)

// Get explorer URL for transactions
const txHash = '0x123...'
const explorerUrl = provider.getTransactionUrl(txHash)
console.log('View transaction:', explorerUrl)
```

### Custom HTTP Client Configuration

Advanced configuration for production environments:

```typescript
import { KleverProvider } from '@klever/connect-provider'

// Production-ready configuration
const provider = new KleverProvider({
  network: 'mainnet',
  timeout: 10000, // 10 second timeout
  headers: {
    'User-Agent': 'MyApp/1.0.0',
    'X-API-Key': process.env.API_KEY || '',
  },
  retry: {
    maxRetries: 5, // Retry up to 5 times
  },
  cache: {
    ttl: 15000, // Cache for 15 seconds
    maxSize: 200, // Store up to 200 entries
  },
  debug: process.env.DEBUG === 'true', // Enable debug logging
})

// Disable caching for real-time data
const realtimeProvider = new KleverProvider({
  network: 'mainnet',
  cache: false, // Disable cache
})

// Disable retries for faster failures
const fastFailProvider = new KleverProvider({
  network: 'testnet',
  retry: false, // No retries
  timeout: 5000, // Fail fast
})
```

### Cache Management

Control caching behavior for optimal performance:

```typescript
import { KleverProvider } from '@klever/connect-provider'

const provider = new KleverProvider({
  cache: {
    ttl: 15000, // 15 seconds (3-4 blocks on Klever)
    maxSize: 100, // Store up to 100 entries
  },
})

// Normal request - uses cache
const account1 = await provider.getAccount('klv1...')

// Force skip cache for real-time data
const account2 = await provider.getAccount('klv1...', { skipCache: true })

// Clear all cached data
provider.clearCache()
console.log('Cache cleared')
```

## Advanced Usage

### Custom Network Configuration

Create and use custom network configurations:

```typescript
import { KleverProvider, createCustomNetwork } from '@klever/connect-provider'

// Method 1: Shorthand custom network
const provider1 = new KleverProvider({
  url: 'https://my-node.example.com',
  chainId: '999',
})

// Method 2: Full custom network configuration
const customNetwork = createCustomNetwork({
  chainId: '999',
  api: 'https://api.my-network.com',
  node: 'https://node.my-network.com',
  ws: 'wss://ws.my-network.com',
  explorer: 'https://explorer.my-network.com',
  isTestnet: true,
})

const provider2 = new KleverProvider({ network: customNetwork })

console.log('Custom network chain ID:', provider2.getNetwork().chainId)
```

### Using Receipt Parsers

Type-safe parsing of transaction receipts:

```typescript
import { KleverProvider, parseReceipt } from '@klever/connect-provider'

const provider = new KleverProvider()

// After a freeze transaction
const freezeTx = await provider.getTransaction(freezeTxHash)
if (freezeTx) {
  const { bucketId, amount, kda, freezes } = parseReceipt.freeze(freezeTx)
  console.log(`Frozen ${amount} ${kda} in bucket ${bucketId}`)

  // Multiple freezes in one transaction
  if (freezes) {
    console.log(`Total freeze operations: ${freezes.length}`)
    freezes.forEach((f) => {
      console.log(`  ${f.amount} ${f.kda} -> bucket ${f.bucketId}`)
    })
  }
}

// After a transfer transaction
const transferTx = await provider.getTransaction(transferTxHash)
if (transferTx) {
  const { sender, receiver, amount, kda } = parseReceipt.transfer(transferTx)
  console.log(`${sender} sent ${amount} ${kda} to ${receiver}`)
}

// After a claim transaction
const claimTx = await provider.getTransaction(claimTxHash)
if (claimTx) {
  const { rewards, totalClaimed, claimType } = parseReceipt.claim(claimTx)
  console.log(`Claimed ${totalClaimed} across ${rewards.length} assets`)
  rewards.forEach((r) => console.log(`  ${r.amount} ${r.kda}`))

  const claimTypes = ['Staking', 'Market', 'Allowance', 'FPR']
  console.log(`Type: ${claimTypes[claimType || 0]}`)
}

// After a delegation
const delegateTx = await provider.getTransaction(delegateTxHash)
if (delegateTx) {
  const { validator, bucketId } = parseReceipt.delegate(delegateTx)
  console.log(`Delegated bucket ${bucketId} to ${validator}`)
}
```

### Combining with Wallet for Transactions

Use provider with wallet package for complete transaction flow:

```typescript
import { KleverProvider } from '@klever/connect-provider'
import { Wallet } from '@klever/connect-wallet'

const provider = new KleverProvider('testnet')
const wallet = new Wallet(privateKey, provider)

// Build, sign, and send transaction
const tx = await wallet.sendTransaction({
  type: 'transfer',
  receiver: 'klv1...',
  amount: 1000000n,
  kda: 'KLV',
})

console.log('Transaction hash:', tx.hash)

// Wait for confirmation
const confirmedTx = await provider.waitForTransaction(tx.hash)
if (confirmedTx) {
  // Parse receipt
  const transfer = parseReceipt.transfer(confirmedTx)
  console.log(`Transfer complete: ${transfer.amount} ${transfer.kda}`)
}
```

### Smart Contract Queries

Query smart contracts without gas costs:

```typescript
import { KleverProvider } from '@klever/connect-provider'

const provider = new KleverProvider()

// Query contract method
const result = await provider.queryContract({
  scAddress: 'klv1contract...',
  funcName: 'getBalance',
  args: ['klv1user...'],
})

if (result.error) {
  console.error('Query failed:', result.error)
} else {
  console.log('Return data:', result.data?.returnData)
  console.log('Gas remaining:', result.data?.gasRemaining)
  console.log('Return code:', result.data?.returnCode)
}

// Query with encoded arguments
const encodedResult = await provider.queryContract({
  scAddress: 'klv1contract...',
  funcName: 'complexQuery',
  args: ['0x1234...', '0x5678...'], // Hex-encoded arguments
})
```

### Testnet Development

Use testnet faucet for development:

```typescript
import { KleverProvider } from '@klever/connect-provider'

const provider = new KleverProvider('testnet')

// Request test KLV from faucet
const faucetResult = await provider.requestTestKLV('klv1...')
console.log('Faucet transaction:', faucetResult.txHash)
console.log('Status:', faucetResult.status)

// Wait for faucet transaction to complete
await provider.waitForTransaction(faucetResult.txHash)

// Check new balance
const balance = await provider.getBalance('klv1...')
console.log('New balance:', balance)

// Optional: Request specific amount
const customAmount = await provider.requestTestKLV('klv1...', 5000000n)
```

## Error Handling

The provider uses custom error classes for better error handling:

```typescript
import { NetworkError, ValidationError, TransactionError } from '@klever/connect-core'

try {
  const account = await provider.getAccount('invalid-address')
} catch (error) {
  if (error instanceof ValidationError) {
    // Input validation failed
    console.error('Validation error:', error.message)
    console.error('Context:', error.context)
  }
}

try {
  const tx = await provider.getTransaction('0x...')
} catch (error) {
  if (error instanceof NetworkError) {
    // Network request failed
    console.error('Network error:', error.message)
    // Implement retry logic or fallback
  }
}

try {
  const hash = await provider.sendRawTransaction(signedTx)
} catch (error) {
  if (error instanceof TransactionError) {
    // Transaction broadcast or execution failed
    console.error('Transaction error:', error.message)
    console.error('Context:', error.context)
  }
}
```

## Performance Tips

### 1. Use Caching Wisely

```typescript
// Enable caching for frequently accessed data
const provider = new KleverProvider({
  cache: {
    ttl: 15000, // 15s = ~3-4 blocks
    maxSize: 200, // Adjust based on your needs
  },
})

// Disable cache for real-time critical data
const realtimeBalance = await provider.getBalance('klv1...', 'KLV')
```

### 2. Batch Related Requests

```typescript
// Bad: Sequential requests
const account1 = await provider.getAccount('klv1address1...')
const account2 = await provider.getAccount('klv1address2...')
const account3 = await provider.getAccount('klv1address3...')

// Good: Parallel batch request
const [account1, account2, account3] = await provider.batch([
  () => provider.getAccount('klv1address1...'),
  () => provider.getAccount('klv1address2...'),
  () => provider.getAccount('klv1address3...'),
])
```

### 3. Optimize Polling

```typescript
// Use waitForTransaction instead of manual polling
const tx = await provider.waitForTransaction(txHash)

// If you must poll manually, use reasonable intervals
const pollInterval = 3000 // 3 seconds (1 block)
```

### 4. Configure Retries Appropriately

```typescript
// Production: More retries for reliability
const prodProvider = new KleverProvider({
  retry: { maxRetries: 5 },
})

// Development: Fewer retries for faster feedback
const devProvider = new KleverProvider({
  retry: { maxRetries: 2 },
})
```

### 5. Reuse Provider Instances

```typescript
// Bad: Creating new providers repeatedly
function getBalance(address: string) {
  const provider = new KleverProvider() // Don't do this!
  return provider.getBalance(address)
}

// Good: Reuse single provider instance
const provider = new KleverProvider()

function getBalance(address: string) {
  return provider.getBalance(address)
}
```

## Related Packages

### Core Packages

- **[@klever/connect-core](../connect-core)** - Core types, constants, and utilities used by the provider
- **[@klever/connect-encoding](../connect-encoding)** - Proto encoding/decoding for transactions
- **[@klever/connect-crypto](../connect-crypto)** - Cryptographic operations for signing

### Transaction & Wallet Packages

- **[@klever/connect-transactions](../connect-transactions)** - Build transactions offline and broadcast with provider
- **[@klever/connect-wallet](../connect-wallet)** - Wallet implementation that uses provider for broadcasting
- **[@klever/connect-contracts](../connect-contracts)** - Smart contract abstraction built on provider's query/broadcast methods

### React Integration

- **[@klever/connect-react](../connect-react)** - React hooks that wrap provider methods for easy dApp development

### Main Package

- **[@klever/connect](../connect)** - Main entry point that exports provider and other packages

## License

MIT
