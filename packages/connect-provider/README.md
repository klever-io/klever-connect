# @klever/connect-provider

Network provider for Klever Connect SDK - handles all blockchain interactions.

## Installation

```bash
npm install @klever/connect-provider
```

## Usage

```typescript
import { KleverProvider, NETWORKS } from '@klever/connect-provider'

// Connect to mainnet (default)
const provider = new KleverProvider()

// Or connect to testnet
const testnetProvider = new KleverProvider({ network: NETWORKS.testnet })

// Get account balance
const balance = await provider.getBalance('klv1...')

// Get account details
const account = await provider.getAccount('klv1...')

// Broadcast transaction
const txHash = await provider.sendRawTransaction(tx.toHex())
```

## Features

- Network configuration (mainnet/testnet)
- Account queries (balance, nonce, etc.)
- Transaction broadcasting
- Block queries
- Caching support
- Error handling

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

## License

MIT
