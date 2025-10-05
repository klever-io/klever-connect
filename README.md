# Klever Connect SDK

> **The official JavaScript/TypeScript SDK for Klever Blockchain** - A comprehensive Web3 library inspired by ethers.js, CosmJS, and @solana/web3.js

[![npm version](https://img.shields.io/npm/v/@klever/connect.svg)](https://www.npmjs.com/package/@klever/connect)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

## 🚀 Quick Start

```bash
npm install @klever/connect
# or
yarn add @klever/connect
# or
pnpm add @klever/connect
```

```typescript
import { Klever, Wallet, parseKLV } from '@klever/connect'

// Initialize provider
const klever = new Klever({ network: 'mainnet' })

// Create wallet (signer)
const wallet = new Wallet(privateKey, klever)

// Send transaction
const tx = await wallet.sendTransaction({
  to: 'klv1abc...',
  value: parseKLV('100'),
})

console.log('Transaction hash:', tx.hash)
```

## 🎯 Why Klever Connect?

Built by Web3 developers, for Web3 developers. If you've used ethers.js or web3.js, you'll feel right at home.

### Key Features

- 🔐 **Offline Transaction Building** - Build and sign transactions without network access using Proto encoding
- 📦 **Modular Architecture** - Import only what you need, tree-shakeable design
- 🔷 **Full TypeScript Support** - First-class TypeScript with branded types for safety
- ⚡ **Modern Async/Await API** - Clean, promise-based interfaces
- 🔌 **Multiple Wallet Support** - Hardware, browser extension, and mobile wallets
- ⚛️ **React Ready** - Built-in hooks and components for dApps
- 🛡️ **Security First** - Audited cryptographic operations
- 📱 **Works Everywhere** - Node.js, browsers, React Native

## 📚 Documentation

### Core Concepts

#### Provider (Read-Only Access)

Connect to Klever blockchain to read data:

```typescript
const provider = new KleverProvider('mainnet')

// Read blockchain data
const balance = await provider.getBalance('klv1...')
const block = await provider.getBlock('latest')
const tx = await provider.getTransaction(txHash)
```

#### Wallet/Signer (Write Access)

Sign and send transactions:

```typescript
// From private key
const wallet = new Wallet(privateKey, provider)

// From mnemonic (HD Wallet)
const hdWallet = Wallet.fromMnemonic(mnemonic, provider)

// Connect browser extension
const browserWallet = await BrowserWallet.connect()
```

#### Offline Transaction Building

Build transactions without network access:

```typescript
import { TransactionBuilder } from '@klever/connect'

const tx = TransactionBuilder.transfer({
  from: 'klv1...',
  to: 'klv1...',
  amount: parseKLV('100'),
  nonce: 5,
})

// Sign offline
const signedTx = await wallet.signTransaction(tx)

// Broadcast later
const receipt = await provider.sendRawTransaction(signedTx)
```

### Smart Contracts

```typescript
import { Contract } from '@klever/connect'

const contract = new Contract(address, abi, wallet)

// Read contract state
const balance = await contract.balanceOf(address)

// Send transaction
const tx = await contract.transfer(recipient, amount)
await tx.wait() // Wait for confirmation
```

### React Integration

```tsx
import { KleverProvider, useKlever } from '@klever/connect-react'

function App() {
  return (
    <KleverProvider network="mainnet">
      <MyDApp />
    </KleverProvider>
  )
}

function MyDApp() {
  const { account, balance, sendTransaction } = useKlever()

  const handleSend = async () => {
    const tx = await sendTransaction({
      to: recipient,
      value: parseKLV('10'),
    })
    console.log('Sent:', tx.hash)
  }

  return (
    <div>
      <p>Account: {account}</p>
      <p>Balance: {formatKLV(balance)} KLV</p>
      <button onClick={handleSend}>Send KLV</button>
    </div>
  )
}
```

## 🏗️ Package Structure

The SDK is organized into focused, modular packages:

| Package                     | Description                                     | Size  |
| --------------------------- | ----------------------------------------------- | ----- |
| `@klever/connect`           | Main entry point - includes everything you need | ~50KB |
| `@klever/connect-core`      | Core types, constants, and errors               | ~5KB  |
| `@klever/connect-provider`  | Network communication layer                     | ~15KB |
| `@klever/connect-wallet`    | Wallet and signer implementations               | ~20KB |
| `@klever/connect-contracts` | Smart contract interactions                     | ~10KB |
| `@klever/connect-react`     | React hooks and components                      | ~8KB  |

### Advanced Usage - Selective Imports

```typescript
// Import only what you need for smaller bundles
import { KleverProvider } from '@klever/connect-provider'
import { Wallet } from '@klever/connect-wallet'
import { parseKLV } from '@klever/connect-core'
```

## 🔄 Migration Guides

### From Ethereum (ethers.js/web3.js)

```typescript
// Ethereum (ethers.js)
const provider = new ethers.JsonRpcProvider('...')
const wallet = new ethers.Wallet(privateKey, provider)
const tx = await wallet.sendTransaction({
  to: address,
  value: ethers.parseEther('1.0'),
})

// Klever (similar API)
const provider = new KleverProvider('mainnet')
const wallet = new Wallet(privateKey, provider)
const tx = await wallet.sendTransaction({
  to: address,
  value: parseKLV('1.0'),
})
```

### Key Differences from EVM Chains

- **Address Format**: Bech32 format (`klv1...`) instead of hex
- **No Gas**: Uses bandwidth/kAppFee model
- **Proto Encoding**: Transactions use Protocol Buffers
- **Native Multi-Asset**: Built-in support for multiple assets

## 🛠️ Advanced Features

### Staking Operations

```typescript
// Delegate to validator
await klever.staking.delegate(validatorAddress, parseKLV('1000'))

// Undelegate
await klever.staking.undelegate(validatorAddress, parseKLV('500'))

// Claim rewards
await klever.staking.claim()
```

### Asset Management

```typescript
// Create custom token
await klever.assets.create({
  name: 'MyToken',
  ticker: 'MTK',
  precision: 6,
  maxSupply: 1000000,
})

// Freeze/unfreeze assets
await klever.assets.freeze(assetId, amount)
```

### Transaction Monitoring

```typescript
// Watch for events
provider.on('block', (blockNumber) => {
  console.log('New block:', blockNumber)
})

// Transaction receipts with events
const receipt = await tx.wait()
console.log('Events:', receipt.events)
```

## 🧪 Testing

```typescript
import { MockProvider, testAccounts } from '@klever/connect/testing'

// Use mock provider for testing
const provider = new MockProvider()
const [account1, account2] = testAccounts

// Fund test accounts
await provider.fund(account1.address, parseKLV('1000'))

// Test your code
const balance = await provider.getBalance(account1.address)
expect(formatKLV(balance)).toBe('1000')
```

## 📊 Performance

- ⚡ **< 100ms** transaction building
- 🚀 **< 50ms** encoding/decoding
- 📦 **< 10KB** minimal bundle size (with tree-shaking)
- 🔄 **WebSocket** support for real-time updates

## 🔒 Security

- ✅ Audited cryptographic operations
- ✅ Secure key generation using Web Crypto API
- ✅ Constant-time operations for sensitive data
- ✅ No private keys in memory longer than necessary
- ✅ Full input validation and sanitization

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

```bash
# Clone the repo
git clone https://github.com/klever-io/klever-connect.git

# Install dependencies
pnpm install

# Run tests
pnpm test

# Build packages
pnpm build
```

## 📖 Resources

- 📚 [Full Documentation](https://docs.klever.org)
- 💬 [Forum Community](https://forum.klerver.org)
- 🐛 [Issue Tracker](https://github.com/klever-io/klever-connect/issues)
- 📹 [Video Tutorials](https://youtube.com/klever)
- 🎮 [Interactive Playground](https://playground.klever.org)

## 🏆 Projects Using Klever Connect

- [KleverScan](https://kleverscan.org) - Blockchain Explorer
- [Klever Wallet](https://klever.io/wallet) - Official Wallet
- [BitcoinME](https://defi.bitcoin.me) - Decentralized Exchange on Klever Blockchain

## 📄 License

MIT License - see [LICENSE](LICENSE) for details

## 🙏 Acknowledgments

Inspired by the excellent work of:

- [ethers.js](https://github.com/ethers-io/ethers.js/)
- [CosmJS](https://github.com/cosmos/cosmjs)
- [@solana/web3.js](https://github.com/solana-labs/solana-web3.js)

---

<div align="center">
  <b>Built with ❤️ by the Klever Team</b>
  <br />
  <a href="https://klever.org">klever.org</a> •
  <a href="https://twitter.com/klever_io">Twitter</a> •
  <a href="https://github.com/klever-io">GitHub</a>
</div>
