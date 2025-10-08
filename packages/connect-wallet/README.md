# @klever/connect-wallet

Wallet implementations for Klever Connect SDK - manage keys and sign transactions.

## Overview

`@klever/connect-wallet` provides secure wallet management for the Klever Blockchain with support for multiple environments and wallet types. Choose the right wallet implementation for your use case.

### Key Features

- **Multi-Environment Support** - Node.js, Browser, and React Native (coming soon)
- **Dual-Mode BrowserWallet** - Extension mode (secure) or private key mode (testing)
- **NodeWallet** - Server-side operations with PEM file support
- **WalletFactory** - Automatic environment detection for cross-platform apps
- **Transaction Signing** - Ed25519 signature scheme for all transaction types
- **Message Signing** - Sign arbitrary messages for authentication
- **Event System** - Listen for account changes and connection events
- **PEM Support** - Import encrypted/unencrypted PEM files
- **TypeScript First** - Full type safety and IntelliSense support

## Installation

```bash
npm install @klever/connect-wallet
```

**Peer Dependencies:**

```bash
npm install @klever/connect-core @klever/connect-crypto @klever/connect-provider @klever/connect-transactions
```

## Quick Start

### Browser Extension Mode (Recommended for dApps)

```typescript
import { BrowserWallet } from '@klever/connect-wallet'
import { KleverProvider } from '@klever/connect-provider'

const provider = new KleverProvider({ network: 'mainnet' })
const wallet = new BrowserWallet(provider)

await wallet.connect() // Opens Klever Extension
console.log('Connected:', wallet.address)

// Send a transaction (user confirms in extension)
const result = await wallet.transfer({
  receiver: 'klv1...',
  amount: 1000000, // 1 KLV (6 decimals)
})
console.log('Transaction hash:', result.hash)
```

### Node.js Server (Backend/CLI)

```typescript
import { NodeWallet } from '@klever/connect-wallet'
import { KleverProvider } from '@klever/connect-provider'

const provider = new KleverProvider({ network: 'mainnet' })
const wallet = new NodeWallet(provider, process.env.PRIVATE_KEY)

await wallet.connect()
console.log('Connected:', wallet.address)

const result = await wallet.transfer({
  receiver: 'klv1...',
  amount: 1000000,
})
```

## Wallet Comparison

| Feature                       | BrowserWallet (Extension) | BrowserWallet (Private Key) | NodeWallet |
| ----------------------------- | ------------------------- | --------------------------- | ---------- |
| **Environment**               | Browser only              | Browser only                | Node.js    |
| **Security**                  | High (extension vault)    | Medium (memory)             | Medium     |
| **User Confirmation**         | Yes (extension UI)        | No                          | No         |
| **Private Key Storage**       | Extension manages         | Developer manages           | Developer  |
| **Best For**                  | Production dApps          | Testing/Development         | Backends   |
| **Klever Extension Required** | Yes                       | No                          | No         |
| **Account Switching**         | Yes (automatic)           | No                          | No         |
| **Network Switching**         | Yes (extension)           | Manual                      | Manual     |
| **PEM File Support**          | Yes (via extension)       | Yes                         | Yes        |

### When to Use Each Wallet Type

**BrowserWallet (Extension Mode):**

- Production dApps and web applications
- When users control their own keys
- Multi-account support needed
- Best user experience with confirmation dialogs

**BrowserWallet (Private Key Mode):**

- Testing and development
- Browser-based tools or demos
- When extension is not available
- NOT recommended for production with real funds

**NodeWallet:**

- Backend services and automation
- CLI tools and scripts
- Server-side transaction signing
- Batch operations and scheduled tasks

## Usage Examples

### BrowserWallet - Extension Mode

#### Basic Connection

```typescript
import { BrowserWallet } from '@klever/connect-wallet'
import { KleverProvider } from '@klever/connect-provider'

const provider = new KleverProvider({ network: 'mainnet' })
const wallet = new BrowserWallet(provider)

try {
  await wallet.connect()
  console.log('Connected to:', wallet.address)
  console.log('Public key:', wallet.publicKey)
} catch (error) {
  if (error.message.includes('Extension not found')) {
    alert('Please install Klever Extension: https://klever.io/extension')
  }
}
```

#### Listening to Account Changes

```typescript
const wallet = new BrowserWallet(provider)
await wallet.connect()

// User switches accounts in extension
wallet.on('accountChanged', ({ address }) => {
  console.log('Account switched to:', address)
  // Update UI, reload balances, etc.
})

// User switches to different blockchain
wallet.on('disconnect', () => {
  console.log('User disconnected or switched chains')
  // Show connection UI
})
```

#### Signing Messages for Authentication

```typescript
const wallet = new BrowserWallet(provider)
await wallet.connect()

// Sign authentication message
const message = `Sign in to MyDapp\nNonce: ${Date.now()}`
const signature = await wallet.signMessage(message) // User confirms in extension

// Send to backend for verification
const response = await fetch('/api/auth', {
  method: 'POST',
  body: JSON.stringify({
    address: wallet.address,
    message,
    signature: signature.toHex(),
  }),
})
```

### BrowserWallet - Private Key Mode

**WARNING: Only use private key mode for testing. Never use with real funds in production.**

```typescript
import { BrowserWallet } from '@klever/connect-wallet'

// Testing only - DO NOT use in production
const wallet = new BrowserWallet(provider, {
  privateKey: '0x123...', // Your test private key
})

await wallet.connect() // No extension needed
const result = await wallet.transfer({
  receiver: 'klv1...',
  amount: 1000000,
})
```

#### Using PEM Files in Browser

```typescript
// Load PEM file content (e.g., from file input)
const pemContent = await file.text()

const wallet = new BrowserWallet(provider, {
  pemContent,
  pemPassword: 'your-password', // Optional, for encrypted PEMs
})

await wallet.connect()
console.log('Loaded from PEM:', wallet.address)
```

### NodeWallet - Server Side

#### Basic Usage

```typescript
import { NodeWallet } from '@klever/connect-wallet'
import { KleverProvider } from '@klever/connect-provider'

const provider = new KleverProvider({ network: 'mainnet' })
const wallet = new NodeWallet(provider, process.env.PRIVATE_KEY)

await wallet.connect()

// Check balance
const balance = await wallet.getBalance()
console.log('Balance:', balance / 1000000n, 'KLV') // Convert to KLV

// Get nonce
const nonce = await wallet.getNonce()
console.log('Next nonce:', nonce)
```

#### Loading from PEM Files

```typescript
import { NodeWallet } from '@klever/connect-wallet'
import { cryptoProvider } from '@klever/connect-crypto'

const provider = new KleverProvider({ network: 'mainnet' })

// Load encrypted PEM file
const pemResult = await cryptoProvider.importPrivateKeyFromPemFile('./wallet.pem', {
  password: process.env.PEM_PASSWORD,
})

const wallet = new NodeWallet(provider, pemResult.toHex())
await wallet.connect()
console.log('Loaded wallet:', wallet.address)
```

#### Generating New Wallets

```typescript
import { NodeWallet } from '@klever/connect-wallet'

// Generate a new random wallet
const newWallet = await NodeWallet.generate(provider)
await newWallet.connect()

console.log('New wallet created!')
console.log('Address:', newWallet.address)
console.log('IMPORTANT: Save your private key securely!')
```

#### Secure Disconnect

```typescript
const wallet = new NodeWallet(provider, privateKey)
await wallet.connect()

// ... perform operations ...

// Clear private key from memory (recommended)
await wallet.disconnect(true)

// Cannot reconnect - need new wallet instance
// await wallet.connect() // ❌ Throws error
```

### WalletFactory - Cross-Platform

```typescript
import { WalletFactory } from '@klever/connect-wallet'
import { KleverProvider } from '@klever/connect-provider'

const provider = new KleverProvider({ network: 'mainnet' })
const factory = new WalletFactory(provider)

// Automatically creates NodeWallet in Node.js, BrowserWallet in browser
const wallet = await factory.createWallet({
  privateKey: process.env.PRIVATE_KEY, // Required in Node.js, optional in browser
})

await wallet.connect()
console.log('Wallet type auto-detected:', wallet.constructor.name)
```

**Convenience Function:**

```typescript
import { createWallet } from '@klever/connect-wallet'

const wallet = await createWallet({
  network: 'testnet',
  privateKey: process.env.PRIVATE_KEY,
})

await wallet.connect()
```

## Common Use Cases

### 1. Generate New Wallet and Save Securely

```typescript
import { NodeWallet } from '@klever/connect-wallet'
import { hexEncode } from '@klever/connect-encoding'
import fs from 'fs/promises'

// Generate new wallet
const wallet = await NodeWallet.generate(provider)
await wallet.connect()

console.log('New address:', wallet.address)

// IMPORTANT: Save private key securely
// Option 1: Environment variable (recommended)
console.log('Add to .env file:')
console.log(`PRIVATE_KEY=${process.env.PRIVATE_KEY}`)

// Option 2: Encrypted storage (production)
// Use proper key management system, HSM, or vault
```

### 2. Load Wallet from PEM File

**Node.js:**

```typescript
import { NodeWallet } from '@klever/connect-wallet'
import { cryptoProvider } from '@klever/connect-crypto'

const pemResult = await cryptoProvider.importPrivateKeyFromPemFile('./wallet.pem', {
  password: process.env.PEM_PASSWORD, // Optional for unencrypted
})

const wallet = new NodeWallet(provider, pemResult.toHex())
await wallet.connect()
```

**Browser:**

```typescript
import { BrowserWallet } from '@klever/connect-wallet'

// From file input
const fileInput = document.querySelector('input[type="file"]')
fileInput.addEventListener('change', async (e) => {
  const file = e.target.files[0]
  const pemContent = await file.text()

  const wallet = new BrowserWallet(provider, {
    pemContent,
    pemPassword: prompt('Enter PEM password:'),
  })

  await wallet.connect()
  console.log('Loaded:', wallet.address)
})
```

### 3. Connect Browser Extension Wallet

```typescript
import { BrowserWallet } from '@klever/connect-wallet'

const wallet = new BrowserWallet(provider)

// Check if extension is available
if (typeof window.kleverWeb === 'undefined') {
  alert('Please install Klever Extension')
  window.open('https://klever.io/extension', '_blank')
} else {
  await wallet.connect()
  console.log('Connected via extension:', wallet.address)
}
```

### 4. Sign Messages for Authentication

```typescript
// Frontend - Sign message
const message = `Welcome to MyDapp!\nSign to authenticate.\nNonce: ${Date.now()}`
const signature = await wallet.signMessage(message)

// Send to backend
await fetch('/api/auth', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    address: wallet.address,
    message,
    signature: signature.toHex(),
  }),
})

// Backend - Verify signature
import { verifySignature } from '@klever/connect-crypto'
import { hexDecode } from '@klever/connect-encoding'

const messageBytes = new TextEncoder().encode(message)
const signatureBytes = hexDecode(signature)
const publicKeyBytes = hexDecode(publicKey)

const isValid = await verifySignature(messageBytes, signatureBytes, publicKeyBytes)
if (!isValid) {
  throw new Error('Invalid signature')
}
```

### 5. Build and Sign Transactions

```typescript
import { TransactionBuilder } from '@klever/connect-transactions'
import { TXType } from '@klever/connect-core'

// Build transaction
const builder = new TransactionBuilder(provider)
builder
  .addContract({
    contractType: TXType.Transfer,
    receiver: 'klv1...',
    amount: '1000000',
  })
  .sender(wallet.address)

const unsignedTx = await builder.build()

// Sign transaction
const signedTx = await wallet.signTransaction(unsignedTx)

// Broadcast
const hash = await wallet.broadcastTransaction(signedTx)
console.log('Transaction hash:', hash)
```

### 6. Verify Signatures

```typescript
const message = 'Hello, Klever!'
const signature = await wallet.signMessage(message)

// Verify with Signature object
const isValid = await wallet.verifyMessage(message, signature)
console.log('Valid:', isValid) // true

// Verify with hex string
const isValidHex = await wallet.verifyMessage(message, signature.toHex())

// Verify with base64 string
const isValidBase64 = await wallet.verifyMessage(message, signature.toBase64())
```

### 7. Switch Between Accounts (Extension Only)

```typescript
const wallet = new BrowserWallet(provider)
await wallet.connect()

// Listen for account changes
wallet.on('accountChanged', ({ address, chain }) => {
  console.log('Switched to account:', address)
  console.log('Chain:', chain) // 'KLV' or chain ID

  // Reload application state for new account
  loadBalances(address)
  loadTransactionHistory(address)
})

// User switches account in extension
// Event automatically fires
```

## Security Best Practices

### Critical Security Warnings

> **NEVER EXPOSE PRIVATE KEYS**
>
> - Never hardcode private keys in source code
> - Never commit private keys to version control
> - Never log private keys to console or files
> - Never share private keys via insecure channels

> **ALWAYS VERIFY BEFORE SIGNING**
>
> - Check recipient address before signing transactions
> - Verify amounts and contract types
> - Review transaction details carefully
> - Be cautious of phishing attempts

> **USE EXTENSION MODE IN PRODUCTION**
>
> - Extension mode keeps keys secure in extension vault
> - Private key mode should only be used for testing
> - Never use private key mode with real funds in browsers

### Secure Storage Recommendations

#### Node.js Environments

**Environment Variables (Recommended):**

```bash
# .env file (add to .gitignore!)
PRIVATE_KEY=your_private_key_here
PEM_PASSWORD=your_pem_password_here
```

```typescript
import 'dotenv/config'

const wallet = new NodeWallet(provider, process.env.PRIVATE_KEY)
```

**File Permissions for PEM Files:**

```bash
# Restrict PEM file access (Unix/Linux/macOS)
chmod 600 wallet.pem

# Only owner can read/write
ls -la wallet.pem
# Output: -rw------- 1 user group 256 Jan 1 12:00 wallet.pem
```

**Key Management Services (Production):**

```typescript
// AWS Secrets Manager
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager'

const client = new SecretsManagerClient({ region: 'us-east-1' })
const response = await client.send(new GetSecretValueCommand({ SecretId: 'klever/private-key' }))
const privateKey = response.SecretString

const wallet = new NodeWallet(provider, privateKey)
```

```typescript
// HashiCorp Vault
import Vault from 'node-vault'

const vault = Vault({ endpoint: 'http://vault:8200' })
const secret = await vault.read('secret/data/klever')
const privateKey = secret.data.data.privateKey

const wallet = new NodeWallet(provider, privateKey)
```

#### Browser Environments

**Extension Mode (Recommended):**

```typescript
// Keys never enter your application code
const wallet = new BrowserWallet(provider) // No private key needed
await wallet.connect() // Extension manages keys securely
```

**Private Key Mode (Testing Only):**

```typescript
// ⚠️ WARNING: Only for testing/development
// Keys are in browser memory - vulnerable to XSS attacks

// Option 1: Session Storage (cleared on tab close)
sessionStorage.setItem('test-key', testPrivateKey)
const key = sessionStorage.getItem('test-key')
const wallet = new BrowserWallet(provider, { privateKey: key })

// Clear after use
await wallet.disconnect(true)
sessionStorage.removeItem('test-key')

// Option 2: Never store - prompt user each time
const key = prompt('Enter private key (TESTING ONLY):')
const wallet = new BrowserWallet(provider, { privateKey: key })
```

#### React Native (Coming Soon)

```typescript
// Secure storage for mobile apps
import * as SecureStore from 'expo-secure-store'

// Save encrypted
await SecureStore.setItemAsync('privateKey', privateKey)

// Load when needed
const key = await SecureStore.getItemAsync('privateKey')
const wallet = new ReactNativeWallet(provider, key)
```

### PEM File Encryption

**Creating Encrypted PEM Files:**

```bash
# Use Klever CLI or tools to generate encrypted PEM
klever-cli wallet create --encrypt --password "strong-password-123"
```

**Loading Encrypted PEMs:**

```typescript
import { cryptoProvider } from '@klever/connect-crypto'

// Strong password requirements:
// - Minimum 12 characters
// - Mix of uppercase, lowercase, numbers, symbols
// - No dictionary words
// - Use password manager to generate

const pemResult = await cryptoProvider.importPrivateKeyFromPemFile('./wallet.pem', {
  password: process.env.PEM_PASSWORD, // Store password securely
})

const wallet = new NodeWallet(provider, pemResult.toHex())
```

**Password Security:**

- Use password manager (1Password, LastPass, Bitwarden)
- Minimum 12 characters, 16+ recommended
- Never reuse passwords across systems
- Store passwords in environment variables or vaults
- Never commit passwords to version control

### Extension Wallet Benefits

**Why Extension Mode is More Secure:**

1. **Private keys never leave extension** - Your dApp code never sees the keys
2. **User confirmation required** - Every transaction needs user approval
3. **Phishing protection** - Extension shows transaction details clearly
4. **Hardware wallet support** - Extension can integrate with Ledger/Trezor
5. **Account isolation** - Each dApp has isolated storage
6. **Auto-lock** - Extension locks after inactivity

```typescript
// Extension mode - maximum security
const wallet = new BrowserWallet(provider)
await wallet.connect()

// Private key never enters your code
// User confirms every transaction
// Extension can integrate with hardware wallets
```

## Advanced Usage

### WalletFactory for Environment Detection

```typescript
import { WalletFactory } from '@klever/connect-wallet'

const factory = new WalletFactory()

// Same code works in Node.js and Browser
const wallet = await factory.createWallet({
  privateKey: process.env.PRIVATE_KEY, // Optional in browser
  network: 'mainnet',
})

await wallet.connect()

// Check wallet type
if (wallet.constructor.name === 'NodeWallet') {
  console.log('Running in Node.js')
} else if (wallet.constructor.name === 'BrowserWallet') {
  console.log('Running in Browser')
}
```

### Dual-Mode BrowserWallet

BrowserWallet automatically chooses mode based on configuration:

```typescript
// Extension mode (no config)
const extensionWallet = new BrowserWallet(provider)
await extensionWallet.connect() // Uses extension

// Private key mode (with privateKey)
const pkWallet = new BrowserWallet(provider, {
  privateKey: '0x123...',
})
await pkWallet.connect() // No extension needed

// PEM mode (with pemContent)
const pemWallet = new BrowserWallet(provider, {
  pemContent: pemFileContent,
  pemPassword: 'optional-password',
})
await pemWallet.connect()
```

### Event Handling

**Available Events:**

- `connect` - Wallet successfully connected
- `disconnect` - Wallet disconnected or user switched chains
- `accountChanged` - User switched accounts (extension only)

```typescript
const wallet = new BrowserWallet(provider)

wallet.on('connect', ({ address }) => {
  console.log('Connected:', address)
  // Initialize app, load balances, etc.
})

wallet.on('disconnect', () => {
  console.log('Disconnected')
  // Show connection UI, clear state, etc.
})

wallet.on('accountChanged', ({ address, chain }) => {
  console.log('Account changed:', address)
  // Reload data for new account
})

// Remove specific listener
const handler = ({ address }) => console.log(address)
wallet.on('accountChanged', handler)
wallet.off('accountChanged', handler)

// Remove all listeners for an event
wallet.removeAllListeners('accountChanged')

// Remove all listeners
wallet.removeAllListeners()
```

### Multi-Signature Workflows

```typescript
import { TransactionBuilder } from '@klever/connect-transactions'

// Build transaction
const builder = new TransactionBuilder(provider)
const tx = await builder
  .transfer({ receiver: 'klv1...', amount: '1000000' })
  .sender(wallet1.address)
  .build()

// Sign with multiple wallets
await wallet1.signTransaction(tx)
await wallet2.signTransaction(tx)
await wallet3.signTransaction(tx)

// Broadcast multi-signed transaction
const hash = await wallet1.broadcastTransaction(tx)
```

### Batch Transactions

```typescript
import { TXType } from '@klever/connect-core'

const wallet = new BrowserWallet(provider)
await wallet.connect()

// Build multiple transactions
const tx1 = await wallet.buildTransaction([
  { contractType: TXType.Transfer, receiver: 'klv1...', amount: '1000000' },
])

const tx2 = await wallet.buildTransaction([{ contractType: TXType.Claim, claimType: 0 }])

// Sign all
await wallet.signTransaction(tx1)
await wallet.signTransaction(tx2)

// Broadcast as batch
const hashes = await wallet.broadcastTransactions([tx1, tx2])
console.log('Transaction hashes:', hashes)
```

## API Reference

### BaseWallet (Abstract)

Base class for all wallet implementations. Do not instantiate directly.

**Properties:**

- `address: string` - Wallet address (bech32 format)
- `publicKey: string` - Public key (hex format)
- `provider: IProvider` - Provider instance

**Methods:**

- `connect(): Promise<void>` - Connect to wallet
- `disconnect(clearPrivateKey?: boolean): Promise<void>` - Disconnect from wallet
- `isConnected(): boolean` - Check connection status
- `signMessage(message: string | Uint8Array): Promise<Signature>` - Sign message
- `signTransaction(tx: Transaction): Promise<Transaction>` - Sign transaction
- `verifyMessage(message: string | Uint8Array, signature: Signature | string): Promise<boolean>` - Verify signature
- `getBalance(): Promise<bigint>` - Get wallet balance
- `getNonce(): Promise<number>` - Get current nonce
- `broadcastTransaction(tx: Transaction): Promise<TransactionHash>` - Broadcast single transaction
- `broadcastTransactions(txs: Transaction[]): Promise<TransactionHash[]>` - Broadcast multiple transactions
- `sendTransaction(contract: ContractRequestData): Promise<TransactionSubmitResult>` - Build, sign, and broadcast
- `transfer(params: TransferRequest): Promise<TransactionSubmitResult>` - Transfer tokens
- `on(event: WalletEvent, handler: WalletEventHandler): void` - Register event listener
- `off(event: WalletEvent, handler: WalletEventHandler): void` - Remove event listener
- `removeAllListeners(event?: WalletEvent): void` - Remove all listeners

### NodeWallet

Node.js wallet implementation with private key support.

**Constructor:**

```typescript
new NodeWallet(provider: IProvider, privateKey?: string)
```

**Parameters:**

- `provider` - Provider instance for blockchain communication
- `privateKey` - Optional private key as hex string (can be set later)

**Static Methods:**

- `static generate(provider: IProvider): Promise<NodeWallet>` - Generate new random wallet

**Methods:**

- `setPrivateKey(privateKey: string): void` - Set/change private key (only when disconnected)
- All methods from BaseWallet

**Example:**

```typescript
const wallet = new NodeWallet(provider, privateKey)
await wallet.connect()

// Or generate new
const newWallet = await NodeWallet.generate(provider)
await newWallet.connect()
```

### BrowserWallet

Browser wallet implementation with extension and private key modes.

**Constructor:**

```typescript
new BrowserWallet(provider: IProvider, config?: WalletConfig)
```

**Parameters:**

- `provider` - Provider instance
- `config` - Optional wallet configuration
  - `privateKey?: string` - Private key for private key mode
  - `pemContent?: string` - PEM file content
  - `pemPassword?: string` - Password for encrypted PEM

**Additional Methods (Extension Mode):**

- `buildTransaction(contracts: ContractRequestData[], txData?: string[], options?: { nonce?: number; kdaFee?: string }): Promise<Transaction>` - Build unsigned transaction
- `buildTransfer(to: string, amount: string | number, token?: string): Promise<Transaction>` - Build and sign transfer
- `getExtensionProvider(): NetworkURI` - Get extension's provider config
- `updateProvider(provider: NetworkURI): void` - Update extension's provider
- `createAccount(): Promise<{ privateKey: string; address: string }>` - Create new account in extension
- `getAccount(address?: string): Promise<AccountInfo>` - Get account information
- `parsePemFileData(pemData: string): Promise<{ privateKey: string; address: string }>` - Parse PEM via extension
- `setWalletAddress(address: string): Promise<void>` - Set wallet address in extension
- `setPrivateKey(privateKey: string): Promise<void>` - Set private key in extension
- `validateSignature(payload: string): Promise<{ isValid: boolean; signer?: string }>` - Validate signature

**Example:**

```typescript
// Extension mode
const wallet = new BrowserWallet(provider)
await wallet.connect()

// Private key mode
const wallet = new BrowserWallet(provider, { privateKey: '0x123...' })
await wallet.connect()
```

### WalletFactory

Factory for creating environment-appropriate wallets.

**Constructor:**

```typescript
new WalletFactory(provider?: IProvider)
```

**Methods:**

- `createWallet(config?: WalletConfig): Promise<Wallet>` - Create wallet for current environment

**Convenience Function:**

```typescript
createWallet(config?: WalletConfig): Promise<Wallet>
```

**Example:**

```typescript
const factory = new WalletFactory(provider)
const wallet = await factory.createWallet({
  privateKey: process.env.PRIVATE_KEY,
})

// Or use convenience function
const wallet = await createWallet({
  network: 'testnet',
  privateKey: process.env.PRIVATE_KEY,
})
```

### Types

**WalletConfig:**

```typescript
interface WalletConfig {
  privateKey?: string // Private key hex string
  pemContent?: string // PEM file content
  pemPassword?: string // PEM password
  network?: Network // Network to connect to
  provider?: IProvider // Custom provider
}
```

**TransferRequest:**

```typescript
interface TransferRequest {
  receiver: string // Recipient address
  amount: string | number // Amount in smallest units
  kda?: string // Optional token ID (defaults to KLV)
}
```

**WalletEvent:**

```typescript
type WalletEvent = 'connect' | 'disconnect' | 'accountChanged'
```

**WalletEventHandler:**

```typescript
type WalletEventHandler = (data: unknown) => void
```

## Troubleshooting

### Extension Not Found

**Problem:** `Klever Extension not found` error when connecting.

**Solutions:**

1. Install Klever Extension from https://klever.io/extension
2. Check if extension is enabled in browser
3. Refresh page after installing extension
4. Use private key mode for testing without extension

```typescript
// Check before connecting
if (typeof window.kleverWeb === 'undefined') {
  console.error('Extension not installed')
} else {
  await wallet.connect()
}
```

### No Wallet Address in Extension

**Problem:** `No wallet address set in Klever Extension` error.

**Solutions:**

1. Open Klever Extension
2. Create or import a wallet
3. Ensure wallet is unlocked
4. Select an account if multiple exist

### Private Key Format Invalid

**Problem:** `Invalid private key` error when creating NodeWallet.

**Solutions:**

1. Ensure private key is hex format (64 characters)
2. Remove `0x` prefix if present
3. Check for whitespace or newlines

```typescript
// Correct format
const privateKey = 'a1b2c3d4...' // 64 hex characters

// Common mistakes
const wrong1 = '0xa1b2c3d4...' // ❌ Remove 0x prefix
const wrong2 = 'a1b2c3d4\n' // ❌ Remove newlines
```

### PEM Decryption Failed

**Problem:** `Failed to decrypt PEM block` error.

**Solutions:**

1. Verify password is correct
2. Check PEM file is not corrupted
3. Ensure PEM file is in correct format
4. Try with different password encoding

```typescript
// Trim password to remove whitespace
const password = process.env.PEM_PASSWORD?.trim()

const pemResult = await cryptoProvider.importPrivateKeyFromPemFile('./wallet.pem', {
  password,
})
```

### Transaction Signing Failed

**Problem:** Transaction signing fails or is rejected.

**Solutions:**

1. **Extension Mode:**
   - User may have rejected in extension UI
   - Extension may be locked - user needs to unlock
   - Check extension is on correct network
2. **Private Key Mode:**
   - Ensure wallet is connected
   - Verify private key is valid
   - Check transaction is properly built

```typescript
try {
  const signedTx = await wallet.signTransaction(tx)
} catch (error) {
  if (error.message.includes('rejected')) {
    console.log('User rejected transaction')
  } else if (error.message.includes('not connected')) {
    await wallet.connect()
  }
}
```

### Account Changed Events Not Firing

**Problem:** `accountChanged` events not received.

**Solutions:**

1. Ensure using BrowserWallet in extension mode
2. Check KleverHub is initialized (requires newer extension version)
3. Event only fires for KLV chain switches
4. Events are debounced (100ms delay)

```typescript
// Check if hub is available
if (window.kleverHub) {
  wallet.on('accountChanged', ({ address }) => {
    console.log('Account changed:', address)
  })
} else {
  console.log('KleverHub not available - using legacy extension')
}
```

### Cross-Origin Errors

**Problem:** CORS errors when connecting to provider.

**Solutions:**

1. Configure provider with correct CORS headers
2. Use proxy for development
3. Ensure API endpoint allows browser requests

```typescript
const provider = new KleverProvider({
  network: 'mainnet',
  // Or custom node with CORS enabled
  nodeUrl: 'https://your-node-with-cors.com',
})
```

### Memory Leaks with Event Listeners

**Problem:** Application slows down with many wallet instances.

**Solution:** Always clean up event listeners when unmounting.

```typescript
// React example
useEffect(() => {
  const handler = ({ address }) => setAddress(address)
  wallet.on('accountChanged', handler)

  return () => {
    wallet.off('accountChanged', handler)
  }
}, [wallet])

// Or remove all
wallet.removeAllListeners()
```

## Related Packages

- **[@klever/connect-core](../connect-core)** - Core types, errors, and constants
- **[@klever/connect-crypto](../connect-crypto)** - Cryptographic operations and key management
- **[@klever/connect-provider](../connect-provider)** - Blockchain communication and RPC
- **[@klever/connect-transactions](../connect-transactions)** - Transaction building and encoding
- **[@klever/connect-react](../connect-react)** - React hooks and components for wallet integration

## Contributing

Contributions welcome! Please read the [contributing guidelines](../../CONTRIBUTING.md) first.

## License

MIT
