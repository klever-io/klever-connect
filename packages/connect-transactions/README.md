# @klever/connect-transactions

Transaction building for Klever Connect SDK - build and sign transactions offline.

## Installation

```bash
npm install @klever/connect-transactions
```

## Usage

```typescript
import { TransactionBuilder, parseKLV } from '@klever/connect-transactions'
import { KleverProvider } from '@klever/connect-provider'

const provider = new KleverProvider()

// Build a transfer transaction
const tx = await TransactionBuilder.create(provider)
  .sender('klv1fpwjz234gy8aaae3gx0e8q9f52vymzzn3z5q0s5h60pvktzx0n0qwvtux5')
  .transfer({
    receiver: 'klv1fpwjz234gy8aaae3gx0e8q9f52vymzzn3z5q0s5h60pvktzx0n0qwvtux5',
    amount: parseKLV('100'),
  })
  .build()

// Sign with private key
const privateKey = new Uint8Array(32)
await tx.sign(privateKey)

// Broadcast
const txHash = await provider.sendRawTransaction(tx.toHex())
```

## Features

- **Chainable API** - Fluent transaction building
- **Offline-First** - Build transactions without network
- **Type Safe** - Full TypeScript support
- **All Transaction Types** - Transfer, stake, freeze, etc.
- **Fee Estimation** - Automatic fee calculation
- **Nonce Management** - Automatic nonce handling

## API

### `TransactionBuilder.create(provider?)`

Create a new transaction builder.

**Parameters:**

- `provider` - Optional provider for automatic nonce/fee fetching

### Methods

- `.sender(address: Address)` - Set transaction sender
- `.transfer(params)` - Build transfer transaction
- `.freeze(params)` - Build freeze transaction
- `.unfreeze(params)` - Build unfreeze transaction
- `.delegate(params)` - Build delegation transaction
- `.build()` - Build and return transaction

### Transaction Methods

- `sign(privateKey: PrivateKey): Promise<Transaction>` - Sign transaction
- `toHex(): string` - Encode to hex string
- `toProto(): Uint8Array` - Encode to protocol buffer bytes

## Performance

- Transaction building: ~0.003ms (335,000 ops/sec)
- Proto encoding: ~0.0002ms (4.1M ops/sec)

## License

MIT
