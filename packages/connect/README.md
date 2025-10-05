# @klever/connect

Unified JavaScript SDK for interacting with Klever blockchain.

## Installation

```bash
npm install @klever/connect
```

## Quick Start

```typescript
import { KleverProvider, TransactionBuilder, parseKLV, NETWORKS } from '@klever/connect'

// Connect to testnet
const provider = new KleverProvider({ network: NETWORKS.testnet })

// Build transaction
const tx = await TransactionBuilder.create(provider)
  .sender('klv1fpwjz234gy8aaae3gx0e8q9f52vymzzn3z5q0s5h60pvktzx0n0qwvtux5')
  .transfer({
    receiver: 'klv1fpwjz234gy8aaae3gx0e8q9f52vymzzn3z5q0s5h60pvktzx0n0qwvtux5',
    amount: parseKLV('10'),
  })
  .build()

// Sign transaction
const privateKey = new Uint8Array(32) // Your private key
await tx.sign(privateKey)

// Broadcast
const txHash = await provider.sendRawTransaction(tx.toHex())
console.log(`Transaction: ${txHash}`)
```

## What's Included

This package re-exports all functionality from the SDK sub-packages:

- **@klever/connect-core** - Core types, errors, and constants
- **@klever/connect-provider** - Network provider for blockchain interaction
- **@klever/connect-transactions** - Transaction building
- **@klever/connect-wallet** - Wallet implementations
- **@klever/connect-crypto** - Cryptographic operations
- **@klever/connect-encoding** - Protocol buffer encoding/decoding
- **@klever/connect-contracts** - Smart contract interactions

## Key Features

- **Simple API** - Clean, intuitive interface
- **Type Safe** - Full TypeScript support
- **Offline-First** - Build transactions without network
- **Modular** - Use only what you need
- **React-Ready** - Built-in hooks available

## Documentation

Full documentation available at [Klever Connect Docs](https://docs.klever.io/connect)

## License

MIT
