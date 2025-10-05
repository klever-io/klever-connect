# Quickstart Guide

Get up and running with Klever Connect in 5 minutes.

## 1. Install

```bash
npm install @klever/connect
```

## 2. Connect to Klever Blockchain

```typescript
import { KleverProvider, NETWORKS } from '@klever/connect'

// Connect to mainnet (default)
const provider = new KleverProvider()

// Or connect to testnet
const testnetProvider = new KleverProvider({ network: NETWORKS.testnet })
```

## 3. Check Account Balance

```typescript
import { parseKLV, formatKLV } from '@klever/connect'

const address = 'klv1...' // Your Klever address

// Get KLV balance
const balance = await provider.getBalance(address)
console.log(`Balance: ${formatKLV(balance)} KLV`)

// Get account details
const account = await provider.getAccount(address)
console.log(`Nonce: ${account.nonce}`)
```

## 4. Build a Transaction

```typescript
import { TransactionBuilder } from '@klever/connect'

const tx = await TransactionBuilder.create(provider)
  .sender('klv1...') // Your address
  .transfer({
    receiver: 'klv1...', // Recipient address
    amount: parseKLV('10'), // 10 KLV
  })
  .build()
```

## 5. Sign and Broadcast

```typescript
import { cryptoProvider } from '@klever/connect'

// Sign with your private key
const privateKey = new Uint8Array(32) // Your private key bytes
await tx.sign(privateKey)

// Broadcast to network
const txHash = await provider.sendRawTransaction(tx.toHex())
console.log(`Transaction hash: ${txHash}`)
```

## Complete Example

```typescript
import {
  KleverProvider,
  TransactionBuilder,
  parseKLV,
  NETWORKS
} from '@klever/connect'

async function sendKLV() {
  // 1. Setup provider
  const provider = new KleverProvider({ network: NETWORKS.testnet })

  // 2. Build transaction
  const tx = await TransactionBuilder.create(provider)
    .sender('klv1fpwjz234gy8aaae3gx0e8q9f52vymzzn3z5q0s5h60pvktzx0n0qwvtux5')
    .transfer({
      receiver: 'klv1fpwjz234gy8aaae3gx0e8q9f52vymzzn3z5q0s5h60pvktzx0n0qwvtux5',
      amount: parseKLV('10'),
    })
    .build()

  // 3. Sign transaction
  const privateKey = new Uint8Array(32) // Replace with your key
  await tx.sign(privateKey)

  // 4. Broadcast
  const txHash = await provider.sendRawTransaction(tx.toHex())
  console.log(`Success! Transaction: ${txHash}`)
}

sendKLV().catch(console.error)
```

## Convenience Features

### Wait for Transaction Confirmation

```typescript
const txHash = await provider.sendRawTransaction(tx.toHex())

// Wait for confirmation (default: 1 confirmation, 2 minute timeout)
const confirmedTx = await provider.waitForTransaction(txHash)
console.log('Transaction confirmed!', confirmedTx.status)
```

### Batch Multiple Requests

```typescript
// Execute multiple requests in parallel for better performance
const [account1, account2, balance] = await provider.batch([
  () => provider.getAccount('klv1...'),
  () => provider.getAccount('klv1xxx...'),
  () => provider.getBalance('klv1...')
])
```

### Message Signing and Verification

```typescript
import { NodeWallet } from '@klever/connect'

const wallet = new NodeWallet(privateKey)
const message = "Hello, Klever!"

// Sign a message - returns Signature object
const signature = await wallet.signMessage(message)

// Developer chooses encoding format
const hexSignature = signature.toHex()      // Hex format (recommended)
const base64Signature = signature.toBase64() // Base64 format (for JSON)

// Verify with Signature object
const isValid = await wallet.verifyMessage(message, signature)

// Or verify with hex string
const isValidHex = await wallet.verifyMessage(message, hexSignature)

// Or verify with base64 string
const isValidBase64 = await wallet.verifyMessage(message, base64Signature)

console.log('Signature valid:', isValid) // true
```

## Web3 Naming Conventions

The SDK provides familiar aliases for developers coming from other Web3 ecosystems:

- `provider.getAccountInfo(address)` - Alias for `getAccount()` (Solana-style)
- `provider.sendTransaction(tx)` - Alias for `broadcastTransaction()` (Ethereum-style)

Both naming styles are supported - use whichever you prefer!

## Next Steps

- [Provider Setup](./provider-setup.md) - Learn about network configuration and caching
- [First Transaction](./first-transaction.md) - Deep dive into transaction building
- [Wallet Guide](../guides/wallets.md) - Work with wallets and key management
- [React Integration](../guides/react-integration.md) - Use with React applications
