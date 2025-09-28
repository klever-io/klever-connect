# Klever Connect SDK

A modern, modular TypeScript SDK for interacting with the Klever blockchain.

## Architecture

This SDK is built as a monorepo with the following packages:

- **@klever/connect** - Main unified API entry point
- **@klever/connect-core** - Foundation types, constants, and errors
- **@klever/connect-encoding** - All encoding/decoding operations
- **@klever/connect-crypto** - Cryptographic operations
- **@klever/connect-provider** - Network communication layer
- **@klever/connect-transactions** - Transaction building
- **@klever/connect-contracts** - Smart contract interactions
- **@klever/connect-wallet** - Wallet implementations
- **@klever/connect-helpers** - Developer utilities
- **@klever/connect-react** - React hooks and components

## Installation

```bash
pnpm install @klever/connect
```

## Quick Start

```typescript
import { Klever } from '@klever/connect'

const klever = new Klever({ network: 'mainnet' })

// Get account balance
const balance = await klever.getBalance('klv1...')
```

## Development

This project uses pnpm workspaces and Turbo for monorepo management.

### Setup

```bash
pnpm install
```

### Build

```bash
pnpm build
```

### Test

```bash
pnpm test
```

### Development Mode

```bash
pnpm dev
```

## License

MIT