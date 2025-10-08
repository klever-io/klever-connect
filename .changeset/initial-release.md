---
"@klever/connect": minor
"@klever/connect-contracts": minor
"@klever/connect-core": minor
"@klever/connect-crypto": minor
"@klever/connect-encoding": minor
"@klever/connect-provider": minor
"@klever/connect-react": minor
"@klever/connect-transactions": minor
"@klever/connect-wallet": minor
---

First public release - Klever Connect SDK v0.1.0

⚠️ **Beta Release**: This is an early release. APIs may change before v1.0.0.
Please report issues and feedback on GitHub.

A comprehensive TypeScript SDK for Klever blockchain, designed for Web3 developers
with an API inspired by ethers.js, CosmJS, and @solana/web3.js.

**Key Features:**

- **Wallet Management**: Support for Node.js wallets, browser extensions, and hardware wallets
- **Transaction Building**: Offline transaction creation with Proto encoding
- **Smart Contracts**: Complete ABI-based contract interactions with event parsing and type-safe encoding/decoding
- **Provider System**: Network communication with caching and error handling
- **React Integration**: Ready-to-use hooks (`useWallet`, `useBalance`, `useTransaction`, `useStaking`) for dApp development
- **Cryptographic Operations**: Secure key management, PEM file support, and signature verification
- **Type Safety**: Full TypeScript support with branded types for addresses, hashes, and amounts
- **Modular Design**: Tree-shakeable packages - use only what you need (88KB gzipped for full SDK)

**Packages Included:**

- `@klever/connect` - Main entry point with unified API
- `@klever/connect-core` - Core types, constants, and utilities
- `@klever/connect-crypto` - Cryptographic operations and key management
- `@klever/connect-encoding` - Proto encoding/decoding
- `@klever/connect-provider` - Network provider for blockchain queries
- `@klever/connect-transactions` - Transaction builder and signing
- `@klever/connect-contracts` - Smart contract interactions with ABI support
- `@klever/connect-wallet` - Wallet implementations (Node.js and Browser)
- `@klever/connect-react` - React hooks and context providers

**Getting Started:**

```bash
npm install @klever/connect
```

```typescript
import { Klever, Wallet, parseKLV } from '@klever/connect'

const klever = new Klever({ network: 'mainnet' })
const wallet = new Wallet(privateKey, klever)
const tx = await wallet.sendTransaction({
  to: 'klv1abc...',
  value: parseKLV('100')
})
```

See documentation for detailed guides and API reference.
