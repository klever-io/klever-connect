# @klever/connect

The official JavaScript SDK for interacting with Klever Blockchain - a unified, developer-friendly interface inspired by industry leaders like ethers.js, CosmJS, and @solana/web3.js.

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [What's Included](#whats-included)
- [Choosing the Right Package](#choosing-the-right-package)
- [Complete Example](#complete-example)
- [Architecture Overview](#architecture-overview)
- [Migration from Other SDKs](#migration-from-other-sdks)
- [Key Features](#key-features)
- [Documentation](#documentation)

## Installation

```bash
npm install @klever/connect
# or
yarn add @klever/connect
# or
pnpm add @klever/connect
```

## Quick Start

Get started with a simple transfer in just a few lines:

```typescript
import { KleverProvider, Wallet, parseKLV, NETWORKS } from '@klever/connect'

// 1. Connect to the network
const provider = new KleverProvider({ network: NETWORKS.testnet })

// 2. Create a wallet
const wallet = new Wallet(privateKey, provider)

// 3. Send KLV
const tx = await wallet.sendTransaction({
  to: 'klv1fpwjz234gy8aaae3gx0e8q9f52vymzzn3z5q0s5h60pvktzx0n0qwvtux5',
  value: parseKLV('100'),
})

// 4. Wait for confirmation
const receipt = await tx.wait()
console.log(`Transaction confirmed: ${receipt.hash}`)
```

## What's Included

The `@klever/connect` package is a **meta-package** that re-exports all functionality from the SDK's modular sub-packages. Think of it as your one-stop-shop for everything Klever blockchain.

### Core Packages

#### [@klever/connect-core](../connect-core/README.md)

**Foundation layer** - Core types, branded types, errors, constants, and utilities

```typescript
import {
  parseKLV,
  formatKLV,
  KleverAddress,
  TransactionHash,
  KleverError,
  createLogger,
} from '@klever/connect'
```

**Use cases:**

- Type-safe address and hash handling
- KLV amount parsing and formatting
- Custom error handling
- Logging and debugging
- Environment detection

---

#### [@klever/connect-provider](../connect-provider/README.md)

**Network layer** - Blockchain communication and data fetching

```typescript
import { KleverProvider, NETWORKS, createCustomNetwork } from '@klever/connect'

const provider = new KleverProvider({ network: NETWORKS.mainnet })
const balance = await provider.getBalance(address)
const account = await provider.getAccount(address)
```

**Use cases:**

- Reading blockchain data
- Account and balance queries
- Block and transaction information
- Network configuration
- Transaction broadcasting

---

#### [@klever/connect-transactions](../connect-transactions/README.md)

**Transaction layer** - Offline transaction building

```typescript
import { TransactionBuilder, parseKLV } from '@klever/connect'

const tx = await TransactionBuilder.create(provider)
  .sender(myAddress)
  .transfer({
    receiver: recipientAddress,
    amount: parseKLV('100'),
  })
  .build()
```

**Use cases:**

- Building transactions offline
- All transaction types (transfer, freeze, delegate, etc.)
- Nonce and fee management
- Multi-operation transactions

---

#### [@klever/connect-wallet](../connect-wallet/README.md)

**Wallet layer** - Key management and transaction signing

```typescript
import { Wallet, BrowserWallet, createWallet } from '@klever/connect'

// Node.js environment
const wallet = new Wallet(privateKey, provider)

// Browser environment
const browserWallet = new BrowserWallet(provider)

// Auto-detect environment
const autoWallet = createWallet(privateKey, provider)
```

**Use cases:**

- Private key management
- Transaction signing
- Browser and Node.js support
- HD wallet support (coming soon)
- Hardware wallet integration (coming soon)

---

#### [@klever/connect-contracts](../connect-contracts/README.md)

**Smart contract layer** - ABI-based contract interactions

```typescript
import { Contract, ContractFactory } from '@klever/connect'

const contract = new Contract(contractAddress, abi, wallet)

// Call read-only function
const balance = await contract.call.balanceOf(userAddress)

// Invoke state-changing function
const tx = await contract.invoke.transfer(recipient, parseKLV('50'))
await tx.wait()

// Listen to events
const events = await contract.parseEvents(receipt)
```

**Use cases:**

- Smart contract deployment
- Contract function calls (read and write)
- Event parsing and filtering
- Type-safe contract interactions

---

#### [@klever/connect-crypto](../connect-crypto/README.md)

**Cryptography layer** - Low-level cryptographic operations

```typescript
import { crypto, generateKeyPair, verifySignature } from '@klever/connect'

// Generate new key pair
const keyPair = generateKeyPair()

// Sign data
const signature = await crypto.sign(data, privateKey)

// Verify signature
const isValid = verifySignature(data, signature, publicKey)
```

**Use cases:**

- Key pair generation
- Message signing and verification
- PEM file handling
- Low-level cryptographic operations

---

#### [@klever/connect-encoding](../connect-encoding/README.md)

**Encoding layer** - Protocol Buffer encoding/decoding

```typescript
import { KleverEncoder, KleverDecoder } from '@klever/connect'

const encoder = new KleverEncoder()
const encoded = encoder.encodeTransaction(transaction)

const decoder = new KleverDecoder()
const decoded = decoder.decodeTransaction(encodedData)
```

**Use cases:**

- Protocol Buffer encoding/decoding
- Transaction serialization
- Receipt parsing
- Binary data handling

---

#### [@klever/connect-react](../connect-react/README.md)

**React layer** - React hooks and components

```typescript
import { useBalance, useTransaction, useStaking } from '@klever/connect-react'

function MyComponent() {
  const { balance, isLoading } = useBalance()
  const { sendKLV } = useTransaction()
  const { freeze, delegate, claim } = useStaking()

  return (
    <div>
      <p>Balance: {formatKLV(balance)} KLV</p>
      <button onClick={() => sendKLV(recipient, parseKLV('10'))}>
        Send 10 KLV
      </button>
    </div>
  )
}
```

**Use cases:**

- React dApp development
- State management for balances and transactions
- Staking operations UI
- Real-time transaction monitoring

**Note:** Install separately with `npm install @klever/connect-react` (not included in the main package to keep bundle size small for non-React projects)

## Choosing the Right Package

### Should I use `@klever/connect` or individual packages?

#### Use `@klever/connect` (unified package) when:

✅ **You're building a complete dApp**

```typescript
// Everything in one import
import { KleverProvider, Wallet, Contract, parseKLV } from '@klever/connect'
```

✅ **You want the simplest developer experience**

- Single package to install and update
- No need to manage multiple versions
- All exports in one place

✅ **Bundle size is not a critical concern**

- Server-side applications
- Desktop apps (Electron)
- Internal tools

#### Use individual packages when:

✅ **You need minimal bundle size**

```typescript
// Only import what you need
import { parseKLV } from '@klever/connect-core'
import { KleverProvider } from '@klever/connect-provider'
```

✅ **You're building a library**

- Avoid forcing users to install unused dependencies
- Better dependency management

✅ **You only need specific functionality**

- Backend service that only reads data → `@klever/connect-provider`
- Utility library for address validation → `@klever/connect-core`
- Transaction signing service → `@klever/connect-crypto` + `@klever/connect-transactions`

### Bundle Size Comparison

| Package                        | Approximate Size | What's Included          |
| ------------------------------ | ---------------- | ------------------------ |
| `@klever/connect-core`         | ~15 KB           | Types, utilities, errors |
| `@klever/connect-provider`     | ~25 KB           | Network communication    |
| `@klever/connect-transactions` | ~20 KB           | Transaction building     |
| `@klever/connect-wallet`       | ~18 KB           | Wallet management        |
| `@klever/connect-contracts`    | ~22 KB           | Smart contracts          |
| `@klever/connect-crypto`       | ~30 KB           | Cryptographic operations |
| `@klever/connect-encoding`     | ~35 KB           | Protocol buffers         |
| **Full SDK (@klever/connect)** | **~165 KB**      | Everything above         |

**Tree-shaking benefits:**
Modern bundlers (webpack 5+, Vite, esbuild) can tree-shake unused exports from `@klever/connect`, so you only pay for what you use!

```typescript
// Only KleverProvider code is included in your bundle
import { KleverProvider } from '@klever/connect'
```

## Complete Example

Here's a complete dApp example showing how all packages work together:

```typescript
import {
  // Provider & Network
  KleverProvider,
  NETWORKS,

  // Wallet
  Wallet,
  createWallet,

  // Transaction Building
  TransactionBuilder,

  // Smart Contracts
  Contract,
  ContractFactory,

  // Utilities
  parseKLV,
  formatKLV,
  createLogger,

  // Types
  KleverAddress,
  TransactionHash,

  // Errors
  KleverError,
  TransactionError,
} from '@klever/connect'

// Enable logging
const logger = createLogger({ level: 'info' })

// 1. Setup provider
const provider = new KleverProvider({
  network: NETWORKS.testnet,
  timeout: 30000,
  retries: 3,
})

// 2. Create wallet (auto-detects browser/node)
const wallet = createWallet(privateKey, provider)
const address = await wallet.getAddress()

logger.info(`Wallet address: ${address}`)

// 3. Check balance
const account = await provider.getAccount(address)
logger.info(`Balance: ${formatKLV(account.balance)} KLV`)

// 4. Build and send a simple transfer
async function sendKLV(to: KleverAddress, amount: bigint) {
  try {
    const tx = await TransactionBuilder.create(provider)
      .sender(address)
      .transfer({
        receiver: to,
        amount,
      })
      .build()

    // Sign and broadcast
    await tx.sign(wallet.privateKey)
    const result = await provider.sendRawTransaction(tx.toHex())

    logger.info(`Transaction sent: ${result.hash}`)

    // Wait for confirmation
    const receipt = await result.wait()
    logger.info(`Transaction confirmed in block ${receipt.block}`)

    return receipt
  } catch (error) {
    if (error instanceof TransactionError) {
      logger.error(`Transaction failed: ${error.message}`)
    }
    throw error
  }
}

// 5. Deploy a smart contract
async function deployContract(bytecode: string, abi: any, constructorArgs: any[]) {
  const factory = new ContractFactory(abi, bytecode, wallet)
  const contract = await factory.deploy(...constructorArgs)

  logger.info(`Contract deployed at: ${contract.address}`)
  return contract
}

// 6. Interact with smart contract
async function interactWithContract(contractAddress: KleverAddress, contractABI: any) {
  const contract = new Contract(contractAddress, contractABI, wallet)

  // Read data (no gas cost)
  const name = await contract.call.name()
  const totalSupply = await contract.call.totalSupply()

  logger.info(`Token: ${name}, Total Supply: ${totalSupply}`)

  // Write data (sends transaction)
  const transferTx = await contract.invoke.transfer('klv1recipient...', parseKLV('100'))

  const receipt = await transferTx.wait()

  // Parse events
  const events = await contract.parseEvents(receipt)
  events.forEach((event) => {
    logger.info(`Event: ${event.name}`, event.args)
  })

  return receipt
}

// 7. Advanced: Multi-operation transaction
async function complexTransaction() {
  const tx = await TransactionBuilder.create(provider)
    .sender(address)
    .transfer({
      receiver: 'klv1recipient1...',
      amount: parseKLV('50'),
    })
    .transfer({
      receiver: 'klv1recipient2...',
      amount: parseKLV('30'),
      assetId: 'MY-TOKEN',
    })
    .freeze({
      amount: parseKLV('100'),
      assetId: 'KLV',
    })
    .build()

  await tx.sign(wallet.privateKey)
  const result = await provider.sendRawTransaction(tx.toHex())

  return result.wait()
}

// 8. Error handling
async function safeOperation() {
  try {
    await sendKLV('klv1recipient...', parseKLV('1000'))
  } catch (error) {
    if (error instanceof KleverError) {
      switch (error.code) {
        case 'INSUFFICIENT_FUNDS':
          logger.error('Not enough KLV')
          break
        case 'INVALID_ADDRESS':
          logger.error('Invalid recipient address')
          break
        case 'NETWORK_ERROR':
          logger.error('Network issue, retrying...')
          // Implement retry logic
          break
        default:
          logger.error(`Unknown error: ${error.message}`)
      }
    }
  }
}

// Run the example
async function main() {
  try {
    // Send KLV
    await sendKLV('klv1fpwjz234gy8aaae3gx0e8q9f52vymzzn3z5q0s5h60pvktzx0n0qwvtux5', parseKLV('10'))

    // Complex transaction
    await complexTransaction()

    logger.info('All operations completed successfully!')
  } catch (error) {
    logger.error('Failed:', error)
    process.exit(1)
  }
}

main()
```

### React dApp Example

```typescript
import { KleverProvider, NETWORKS } from '@klever/connect'
import { KleverContextProvider, useBalance, useTransaction } from '@klever/connect-react'

// 1. Setup provider
const provider = new KleverProvider({ network: NETWORKS.testnet })

// 2. Wrap your app
function App() {
  return (
    <KleverContextProvider provider={provider}>
      <DApp />
    </KleverContextProvider>
  )
}

// 3. Use hooks in components
function DApp() {
  const { balance, isLoading: balanceLoading } = useBalance()
  const { sendKLV, isLoading: txLoading } = useTransaction({
    onSuccess: (receipt) => {
      console.log('Transaction confirmed:', receipt.hash)
    },
    onError: (error) => {
      console.error('Transaction failed:', error)
    },
  })

  const handleSend = async () => {
    await sendKLV('klv1recipient...', parseKLV('10'))
  }

  return (
    <div>
      <h1>My Klever dApp</h1>
      {balanceLoading ? (
        <p>Loading balance...</p>
      ) : (
        <p>Balance: {formatKLV(balance)} KLV</p>
      )}
      <button onClick={handleSend} disabled={txLoading}>
        {txLoading ? 'Sending...' : 'Send 10 KLV'}
      </button>
    </div>
  )
}
```

## Architecture Overview

The SDK follows a layered architecture where each package has a specific responsibility:

```
┌─────────────────────────────────────────────────┐
│           @klever/connect (Unified API)         │
│          Re-exports everything below            │
└─────────────────────────────────────────────────┘
                      │
         ┌────────────┼────────────┐
         ▼            ▼            ▼
┌─────────────┐ ┌──────────┐ ┌──────────────┐
│   React     │ │ Wallet   │ │  Contracts   │
│   Layer     │ │  Layer   │ │    Layer     │
└─────────────┘ └──────────┘ └──────────────┘
         │            │            │
         └────────────┼────────────┘
                      ▼
         ┌────────────────────────┐
         │    Transaction Layer   │
         │  (Transaction Builder) │
         └────────────────────────┘
                      │
         ┌────────────┼────────────┐
         ▼            ▼            ▼
┌─────────────┐ ┌──────────┐ ┌──────────┐
│  Provider   │ │  Crypto  │ │ Encoding │
│    Layer    │ │   Layer  │ │   Layer  │
└─────────────┘ └──────────┘ └──────────┘
         │            │            │
         └────────────┼────────────┘
                      ▼
         ┌────────────────────────┐
         │      Core Layer        │
         │  (Types, Errors, Utils)│
         └────────────────────────┘
```

### Design Principles

1. **Layered Architecture** - Clear separation of concerns
2. **Offline-First** - Build transactions without network connectivity
3. **Type Safety** - Full TypeScript with branded types for addresses, hashes, etc.
4. **Modular** - Use only what you need
5. **Provider/Signer Pattern** - Familiar to Ethereum developers (inspired by ethers.js)
6. **Proto-Based** - Native Protocol Buffer support for Klever's transaction format
7. **Environment Agnostic** - Works in Node.js, browsers, and React Native

### Data Flow

```
User Input → Core (Validation) → Transaction Builder (Build) →
Crypto (Sign) → Encoding (Serialize) → Provider (Broadcast) →
Provider (Poll) → Core (Parse) → User Output
```

### Package Dependencies

```
connect-react → connect-wallet → connect-transactions → connect-provider
                                           ↓                    ↓
connect-contracts → connect-encoding → connect-crypto → connect-core
```

## Migration from Other SDKs

### Coming from ethers.js?

The SDK is heavily inspired by ethers.js - you'll feel right at home!

| ethers.js                                | @klever/connect                        | Notes                        |
| ---------------------------------------- | -------------------------------------- | ---------------------------- |
| `new ethers.providers.JsonRpcProvider()` | `new KleverProvider()`                 | Similar provider pattern     |
| `new ethers.Wallet(pk, provider)`        | `new Wallet(pk, provider)`             | Same wallet concept          |
| `ethers.utils.parseEther('1.0')`         | `parseKLV('1.0')`                      | Parse human-readable amounts |
| `ethers.utils.formatEther(wei)`          | `formatKLV(amount)`                    | Format to human-readable     |
| `provider.getBalance(address)`           | `provider.getBalance(address)`         | Same method name             |
| `wallet.sendTransaction(tx)`             | `wallet.sendTransaction(tx)`           | Same method name             |
| `contract.balanceOf(address)`            | `contract.call.balanceOf(address)`     | Explicit call vs invoke      |
| `contract.transfer(to, amount)`          | `contract.invoke.transfer(to, amount)` | Explicit call vs invoke      |

**Key Differences:**

```typescript
// ethers.js - Gas-based fee system
const tx = await wallet.sendTransaction({
  to: recipient,
  value: ethers.utils.parseEther('1.0'),
  gasLimit: 21000,
  gasPrice: ethers.utils.parseUnits('10', 'gwei'),
})

// @klever/connect - Bandwidth/Energy system (no gas)
const tx = await wallet.sendTransaction({
  to: recipient,
  value: parseKLV('1.0'),
  // No gas parameters needed!
})
```

### Coming from web3.js?

| web3.js                            | @klever/connect                   | Notes                |
| ---------------------------------- | --------------------------------- | -------------------- |
| `new Web3(provider)`               | `new KleverProvider()`            | Provider setup       |
| `web3.eth.accounts.create()`       | `generateKeyPair()`               | Generate new account |
| `web3.eth.getBalance(address)`     | `provider.getBalance(address)`    | Get account balance  |
| `web3.eth.sendTransaction(tx)`     | `provider.sendRawTransaction(tx)` | Send transaction     |
| `web3.utils.toWei('1', 'ether')`   | `parseKLV('1')`                   | Parse amounts        |
| `web3.utils.fromWei(wei, 'ether')` | `formatKLV(amount)`               | Format amounts       |

### Coming from @solana/web3.js?

| @solana/web3.js                 | @klever/connect                        | Notes              |
| ------------------------------- | -------------------------------------- | ------------------ |
| `new Connection(endpoint)`      | `new KleverProvider({ network })`      | Network connection |
| `Keypair.generate()`            | `generateKeyPair()`                    | Generate key pair  |
| `connection.getBalance(pubkey)` | `provider.getBalance(address)`         | Get balance        |
| `transaction.add(instruction)`  | `builder.transfer().freeze()`          | Multi-operation tx |
| `sendAndConfirmTransaction()`   | `provider.sendRawTransaction().wait()` | Send and wait      |

### Coming from CosmJS?

| CosmJS                                      | @klever/connect                               | Notes                |
| ------------------------------------------- | --------------------------------------------- | -------------------- |
| `SigningStargateClient.connectWithSigner()` | `new Wallet(pk, provider)`                    | Connect wallet       |
| `client.signAndBroadcast()`                 | `tx.sign()` + `provider.sendRawTransaction()` | Sign and send        |
| `MsgSend`                                   | `TransactionBuilder.transfer()`               | Transfer message     |
| `MsgDelegate`                               | `TransactionBuilder.delegate()`               | Delegate message     |
| Proto encoding                              | `KleverEncoder`                               | Native proto support |

## Key Features

✅ **Developer-First Design**

- Clean, intuitive API inspired by ethers.js
- Comprehensive TypeScript support with branded types
- Excellent IDE autocomplete and type inference

✅ **Offline-First Architecture**

- Build and encode transactions without network
- Sign transactions offline for security
- Only network needed for broadcasting and queries

✅ **Type Safety**

- Branded types prevent mixing addresses, hashes, and strings
- Compile-time validation of transaction parameters
- Full IntelliSense support

✅ **Modular & Tree-Shakeable**

- Import only what you need
- Optimized bundle sizes
- Zero unused code in production

✅ **React-Ready**

- Built-in hooks for common operations
- Context provider for global state
- Real-time balance and transaction monitoring

✅ **Multi-Environment**

- Node.js, Browser, React Native support
- Auto-detection of environment
- Platform-specific optimizations

✅ **Production-Ready**

- Comprehensive error handling
- Automatic retry logic
- Request caching and optimization
- Extensive test coverage

✅ **Protocol Buffer Native**

- Efficient binary encoding
- Full Klever transaction type support
- Metadata preservation

## Documentation

### Package Documentation

- [Core Types & Utilities](../connect-core/README.md)
- [Provider & Network](../connect-provider/README.md)
- [Transaction Building](../connect-transactions/README.md)
- [Wallet Management](../connect-wallet/README.md)
- [Smart Contracts](../connect-contracts/README.md)
- [Cryptography](../connect-crypto/README.md)
- [Protocol Encoding](../connect-encoding/README.md)
- [React Hooks](../connect-react/README.md)

### API Reference

Full API documentation available at [docs.klever.io/connect](https://docs.klever.io/connect)

### Examples

Check the [examples/](../../examples) directory for complete working examples:

- **basic/** - Simple transfers, balance checks
- **transactions/** - All transaction types
- **wallet/** - Key management, signing
- **contracts/** - Smart contract interactions
- **staking/** - Delegation and staking
- **react/** - React integration examples
- **test-app/** - Complete dApp example

## Support & Community

- 📚 [Documentation](https://docs.klever.io/connect)
- 💬 [Discord](https://discord.gg/klever)
- 🐦 [Twitter](https://twitter.com/klever_io)
- 🐛 [Issue Tracker](https://github.com/klever-io/klever-connect/issues)
- 📖 [Changelog](../../CHANGELOG.md)

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](../../CONTRIBUTING.md) for details.

## License

MIT License - see [LICENSE](../../LICENSE) for details

---

Made with ❤️ by the Klever team
