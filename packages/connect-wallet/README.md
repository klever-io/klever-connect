# @klever/connect-wallet

Wallet implementations for Klever Connect SDK - manage keys and sign transactions.

## Installation

```bash
npm install @klever/connect-wallet
```

## Usage

### Browser Wallet

```typescript
import { BrowserWallet } from '@klever/connect-wallet'

const wallet = await BrowserWallet.create()
const address = wallet.getAddress()
```

### Node Wallet (with private key)

```typescript
import { NodeWallet } from '@klever/connect-wallet'

const privateKey = new Uint8Array(32) // Your private key
const wallet = new NodeWallet(privateKey)
const address = wallet.getAddress()
```

### Sign Transaction

```typescript
import { TransactionBuilder } from '@klever/connect-transactions'

const tx = await TransactionBuilder.create(provider)
  .sender(wallet.getAddress())
  .transfer({
    receiver: 'klv1...',
    amount: parseKLV('10'),
  })
  .build()

// Sign with wallet
await wallet.signTransaction(tx)
```

## Features

- **Browser Support** - Web-based wallet management
- **Node Support** - Server-side wallet management
- **Key Generation** - Generate new wallets
- **Transaction Signing** - Sign transactions securely
- **Address Derivation** - Derive addresses from keys

## API

### `BrowserWallet`

Browser-based wallet implementation.

**Methods:**

- `static create(): Promise<BrowserWallet>` - Create new wallet
- `getAddress(): Address` - Get wallet address
- `getBalance(): Promise<bigint>` - Get wallet balance
- `signMessage(message: string | Uint8Array): Promise<Signature>` - Sign arbitrary message, returns Signature object
- `signTransaction(tx: Transaction): Promise<Transaction>` - Sign transaction
- `verifyMessage(message: string | Uint8Array, signature: Signature | string): Promise<boolean>` - Verify message signature (accepts Signature object, hex, or base64)

### `NodeWallet`

Node.js wallet implementation.

**Constructor:**

- `new NodeWallet(privateKey: PrivateKey)` - Create from private key

**Methods:**

- `getAddress(): Address` - Get wallet address
- `getBalance(): Promise<bigint>` - Get wallet balance
- `signMessage(message: string | Uint8Array): Promise<Signature>` - Sign arbitrary message, returns Signature object
- `signTransaction(tx: Transaction): Promise<Transaction>` - Sign transaction
- `verifyMessage(message: string | Uint8Array, signature: Signature | string): Promise<boolean>` - Verify message signature (accepts Signature object, hex, or base64)

## License

MIT
