# Installation

## Prerequisites

- Node.js 16+ or Bun runtime
- npm, pnpm, or yarn package manager

## Install the Main Package

The easiest way to get started is to install the main `@klever/connect` package, which includes everything you need:

```bash
# npm
npm install @klever/connect

# pnpm
pnpm add @klever/connect

# yarn
yarn add @klever/connect

# bun
bun add @klever/connect
```

This single package re-exports all functionality from the SDK sub-packages.

## Install Individual Packages (Optional)

If you want to minimize bundle size by only installing what you need, you can install individual packages:

```bash
# Core types and utilities (required)
npm install @klever/connect-core

# Network provider (for blockchain interaction)
npm install @klever/connect-provider

# Transaction building
npm install @klever/connect-transactions

# Wallet functionality
npm install @klever/connect-wallet

# Cryptographic operations
npm install @klever/connect-crypto

# Protocol buffer encoding/decoding
npm install @klever/connect-encoding

# React hooks (for React applications)
npm install @klever/connect-react
```

## TypeScript Support

All packages are written in TypeScript and include full type definitions. No additional `@types` packages are needed.

## Next Steps

- [Quickstart Guide](./quickstart.md) - Build your first transaction in 5 minutes
- [Provider Setup](./provider-setup.md) - Connect to Klever blockchain
- [First Transaction](./first-transaction.md) - Send your first KLV transfer
