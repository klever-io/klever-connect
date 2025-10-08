# @klever/connect-crypto

Cryptographic operations for Klever Connect SDK - key generation, signing, and verification.

## Installation

```bash
npm install @klever/connect-crypto
# or
pnpm add @klever/connect-crypto
# or
yarn add @klever/connect-crypto
```

## Overview

This package provides secure cryptographic primitives for Klever blockchain:

- **Ed25519 Key Generation** - Secure keypair creation
- **Message Signing** - Sign messages and transactions with Ed25519
- **Signature Verification** - Verify Ed25519 signatures
- **PEM File Support** - Import/export keys in PEM format (encrypted and unencrypted)
- **Address Derivation** - Convert public keys to Klever addresses
- **Async & Sync APIs** - Both async and sync operations for flexibility

## Security

This package uses audited cryptographic libraries:

- **[@noble/ed25519](https://github.com/paulmillr/noble-ed25519)** - Audited Ed25519 implementation
- **[@noble/hashes](https://github.com/paulmillr/noble-hashes)** - Audited hash functions (SHA-512)
- **[@scure/bip39](https://github.com/paulmillr/scure-bip39)** - Audited BIP39 mnemonic implementation

**⚠️ Security Warning**: Never expose private keys in your code. See [Security Best Practices](#security-best-practices) below.

## Quick Start

### Generate a New Keypair

```typescript
import { generateKeyPair } from '@klever/connect-crypto'

// Async generation (recommended)
const keyPair = await generateKeyPair()
console.log('Address:', keyPair.publicKey.toAddress())
console.log('Public Key:', keyPair.publicKey.toHex())

// Sync generation
import { generateKeyPairSync } from '@klever/connect-crypto'
const keyPair2 = generateKeyPairSync()
```

### Sign a Message

```typescript
import { signMessage, generateKeyPair } from '@klever/connect-crypto'

const keyPair = await generateKeyPair()
const message = new TextEncoder().encode('Hello Klever!')

// Async signing (recommended)
const signature = await signMessage(message, keyPair.privateKey)
console.log('Signature:', signature.toHex())

// Sync signing
import { signMessageSync } from '@klever/connect-crypto'
const signature2 = signMessageSync(message, keyPair.privateKey)
```

### Verify a Signature

```typescript
import { verifySignature } from '@klever/connect-crypto'

const isValid = await verifySignature(message, signature, keyPair.publicKey)
console.log('Valid:', isValid) // true
```

### Load Key from PEM File

```typescript
import { loadPrivateKeyFromPem } from '@klever/connect-crypto'

// Unencrypted PEM
const privateKey = loadPrivateKeyFromPem(pemContent)

// Encrypted PEM
const privateKey2 = loadPrivateKeyFromPem(encryptedPemContent, 'password123')
```

## API Reference

### Key Generation

#### `generateKeyPair(): Promise<KeyPair>`

Generate a new Ed25519 keypair asynchronously (recommended).

**Returns:** Promise<KeyPair> with `privateKey` and `publicKey`

**Example:**

```typescript
const { privateKey, publicKey } = await generateKeyPair()
console.log('Address:', publicKey.toAddress())
```

#### `generateKeyPairSync(): KeyPair`

Generate a new Ed25519 keypair synchronously.

**Returns:** KeyPair with `privateKey` and `publicKey`

**Example:**

```typescript
const { privateKey, publicKey } = generateKeyPairSync()
```

#### `getPublicKeyFromPrivate(privateKey: PrivateKey): PublicKey`

Derive public key from private key.

**Parameters:**

- `privateKey` - Private key instance

**Returns:** Corresponding public key

**Example:**

```typescript
const publicKey = getPublicKeyFromPrivate(privateKey)
```

### Key Classes

#### `PrivateKeyImpl`

Represents an Ed25519 private key (32 bytes).

**Properties:**

- `bytes: Uint8Array` - Raw 32-byte private key
- `hex: string` - Hex-encoded private key (getter)

**Methods:**

- `toHex(): string` - Convert to hex string
- `static fromHex(hex: string): PrivateKeyImpl` - Create from hex string
- `static fromBytes(bytes: Uint8Array): PrivateKeyImpl` - Create from bytes

**Example:**

```typescript
import { PrivateKeyImpl } from '@klever/connect-crypto'

const privateKey = PrivateKeyImpl.fromHex('abc123...')
console.log(privateKey.bytes.length) // 32
console.log(privateKey.hex) // 'abc123...'
```

#### `PublicKeyImpl`

Represents an Ed25519 public key (32 bytes).

**Properties:**

- `bytes: Uint8Array` - Raw 32-byte public key
- `hex: string` - Hex-encoded public key (getter)

**Methods:**

- `toHex(): string` - Convert to hex string
- `toAddress(): string` - Convert to Klever address (Bech32 format with 'klv' prefix)
- `static fromHex(hex: string): PublicKeyImpl` - Create from hex string
- `static fromBytes(bytes: Uint8Array): PublicKeyImpl` - Create from bytes

**Example:**

```typescript
import { PublicKeyImpl } from '@klever/connect-crypto'

const publicKey = PublicKeyImpl.fromHex('def456...')
console.log(publicKey.toAddress()) // 'klv1...'
```

### Signing Operations

#### `signMessage(message: Uint8Array, privateKey: PrivateKey): Promise<Signature>`

Sign a message with Ed25519 asynchronously (recommended).

**Parameters:**

- `message` - Message bytes to sign
- `privateKey` - Private key for signing

**Returns:** Promise<Signature> containing the 64-byte Ed25519 signature

**Example:**

```typescript
const message = new TextEncoder().encode('Hello')
const signature = await signMessage(message, privateKey)
```

#### `signMessageSync(message: Uint8Array, privateKey: PrivateKey): Signature`

Sign a message with Ed25519 synchronously.

**Parameters:**

- `message` - Message bytes to sign
- `privateKey` - Private key for signing

**Returns:** Signature containing the 64-byte Ed25519 signature

**Example:**

```typescript
const signature = signMessageSync(message, privateKey)
```

#### `verifySignature(message: Uint8Array, signature: Signature, publicKey: PublicKey): Promise<boolean>`

Verify an Ed25519 signature asynchronously (recommended).

**Parameters:**

- `message` - Original message bytes
- `signature` - Signature to verify
- `publicKey` - Public key for verification

**Returns:** Promise<boolean> - true if valid, false otherwise

**Example:**

```typescript
const isValid = await verifySignature(message, signature, publicKey)
if (isValid) {
  console.log('Signature is valid!')
}
```

#### `verifySignatureSync(message: Uint8Array, signature: Signature, publicKey: PublicKey): boolean`

Verify an Ed25519 signature synchronously.

**Parameters:**

- `message` - Original message bytes
- `signature` - Signature to verify
- `publicKey` - Public key for verification

**Returns:** boolean - true if valid, false otherwise

**Example:**

```typescript
const isValid = verifySignatureSync(message, signature, publicKey)
```

### Signature Class

#### `SignatureImpl`

Represents an Ed25519 signature (64 bytes).

**Properties:**

- `bytes: Uint8Array` - Raw 64-byte signature
- `hex: string` - Hex-encoded signature (getter)

**Methods:**

- `toHex(): string` - Convert to hex string
- `toBase64(): string` - Convert to Base64 string
- `static fromHex(hex: string): SignatureImpl` - Create from hex string
- `static fromBase64(base64: string): SignatureImpl` - Create from Base64 string
- `static fromBytes(bytes: Uint8Array): SignatureImpl` - Create from bytes

**Example:**

```typescript
import { SignatureImpl } from '@klever/connect-crypto'

const signature = SignatureImpl.fromHex('abc123...')
console.log(signature.toBase64())
```

### PEM Operations

#### `loadPrivateKeyFromPem(pemContent: string, password?: string): PrivateKey`

Load a private key from PEM format (supports encrypted and unencrypted PEM).

**Parameters:**

- `pemContent` - PEM file content as string
- `password` - Password for encrypted PEM (optional)

**Returns:** PrivateKey instance

**Throws:** Error if PEM is invalid or password is incorrect

**Example:**

```typescript
import { loadPrivateKeyFromPem } from '@klever/connect-crypto'
import { readFileSync } from 'fs'

// Load unencrypted PEM
const pem = readFileSync('wallet.pem', 'utf8')
const privateKey = loadPrivateKeyFromPem(pem)

// Load encrypted PEM
const encryptedPem = readFileSync('encrypted.pem', 'utf8')
const privateKey2 = loadPrivateKeyFromPem(encryptedPem, 'mypassword')
```

#### `loadPrivateKeyFromPemFile(filePath: string, password?: string): PrivateKey`

Load a private key from PEM file path (Node.js only).

**Parameters:**

- `filePath` - Path to PEM file
- `password` - Password for encrypted PEM (optional)

**Returns:** PrivateKey instance

**Throws:** Error if file doesn't exist, PEM is invalid, or password is incorrect

**Example:**

```typescript
import { loadPrivateKeyFromPemFile } from '@klever/connect-crypto'

const privateKey = loadPrivateKeyFromPemFile('./wallet.pem')
const privateKey2 = loadPrivateKeyFromPemFile('./encrypted.pem', 'password')
```

### Crypto Provider

The package also exports a default `cryptoProvider` instance for advanced use cases:

```typescript
import { cryptoProvider } from '@klever/connect-crypto'

// Or use the convenience alias
import { crypto } from '@klever/connect-crypto'

// Generate keypair
const keyPair = await crypto.generateKeyPair()

// Sign message
const signature = await crypto.signMessage(message, privateKey)
```

## Common Use Cases

### Example 1: Create New Wallet

```typescript
import { generateKeyPair } from '@klever/connect-crypto'

async function createWallet() {
  const keyPair = await generateKeyPair()

  return {
    address: keyPair.publicKey.toAddress(),
    publicKey: keyPair.publicKey.toHex(),
    privateKey: keyPair.privateKey.toHex(), // ⚠️ Store securely!
  }
}

const wallet = await createWallet()
console.log('Address:', wallet.address)
```

### Example 2: Sign Transaction Data

```typescript
import { signMessage } from '@klever/connect-crypto'
import { hashBlake2b } from '@klever/connect-encoding'

async function signTransaction(txBytes: Uint8Array, privateKey: PrivateKey) {
  // Hash transaction
  const txHash = hashBlake2b(txBytes)

  // Sign hash
  const signature = await signMessage(txHash, privateKey)

  return signature
}
```

### Example 3: Verify Message Signature

```typescript
import { verifySignature, PublicKeyImpl } from '@klever/connect-crypto'

async function verifyMessageSignature(
  message: string,
  signatureHex: string,
  publicKeyHex: string,
): Promise<boolean> {
  const messageBytes = new TextEncoder().encode(message)
  const signature = SignatureImpl.fromHex(signatureHex)
  const publicKey = PublicKeyImpl.fromHex(publicKeyHex)

  return await verifySignature(messageBytes, signature, publicKey)
}

const isValid = await verifyMessageSignature('Hello', sigHex, pubKeyHex)
```

### Example 4: Load Wallet from PEM

```typescript
import { loadPrivateKeyFromPem, getPublicKeyFromPrivate } from '@klever/connect-crypto'
import { readFileSync } from 'fs'

function loadWalletFromPem(pemPath: string, password?: string) {
  const pemContent = readFileSync(pemPath, 'utf8')
  const privateKey = loadPrivateKeyFromPem(pemContent, password)
  const publicKey = getPublicKeyFromPrivate(privateKey)

  return {
    privateKey,
    publicKey,
    address: publicKey.toAddress(),
  }
}

const wallet = loadWalletFromPem('./wallet.pem', 'mypassword')
console.log('Wallet address:', wallet.address)
```

## Security Best Practices

### ❌ DON'T DO THIS

```typescript
// NEVER hardcode private keys
const privateKey = PrivateKeyImpl.fromHex('abc123...') // DANGEROUS!

// NEVER store keys in localStorage/sessionStorage
localStorage.setItem('privateKey', privateKey.toHex()) // NEVER!

// NEVER commit keys to git
const KEY = 'abc123...' // INSECURE!
```

### ✅ DO THIS INSTEAD

**Node.js Applications:**

```typescript
// Use environment variables
import { PrivateKeyImpl } from '@klever/connect-crypto'
const privateKey = PrivateKeyImpl.fromHex(process.env.PRIVATE_KEY!)

// Or load from encrypted PEM
import { loadPrivateKeyFromPemFile } from '@klever/connect-crypto'
const privateKey2 = loadPrivateKeyFromPemFile('./wallet.pem', process.env.PEM_PASSWORD)
```

**Browser Applications:**

```typescript
// Use wallet extensions (recommended)
import { BrowserWallet } from '@klever/connect-wallet'
const wallet = await BrowserWallet.connect()

// Or use Web Crypto API for temporary keys
const keyPair = await generateKeyPair()
// Use immediately, don't store
```

**React Native:**

```typescript
// Use secure storage
import * as SecureStore from 'expo-secure-store'

async function storeKey(privateKey: PrivateKey) {
  await SecureStore.setItemAsync('privateKey', privateKey.toHex())
}

async function loadKey() {
  const hex = await SecureStore.getItemAsync('privateKey')
  return PrivateKeyImpl.fromHex(hex!)
}
```

### Key Security Guidelines

1. **Never expose private keys** in client-side code
2. **Use environment variables** for server-side keys
3. **Encrypt keys at rest** using strong passwords
4. **Use hardware wallets** for high-value operations
5. **Clear sensitive data** from memory when done
6. **Use PEM encryption** when storing keys on disk
7. **Implement key rotation** for long-running services

## TypeScript Support

Fully typed with TypeScript:

```typescript
import type { KeyPair, PrivateKey, PublicKey, Signature } from '@klever/connect-crypto'

const keyPair: KeyPair = await generateKeyPair()
const privateKey: PrivateKey = keyPair.privateKey
const publicKey: PublicKey = keyPair.publicKey
```

## Performance

- **Key Generation**: ~0.5ms (async) or ~0.3ms (sync)
- **Signing**: ~0.2ms (async) or ~0.1ms (sync)
- **Verification**: ~0.5ms (async) or ~0.3ms (sync)
- **PEM Loading**: ~1-5ms (depending on encryption)

## Async vs Sync

**When to use async (recommended):**

- Web applications (doesn't block UI)
- Server applications (better concurrency)
- When performance isn't critical

**When to use sync:**

- High-performance scenarios
- When you need immediate results
- Testing and scripts

## Related Packages

- `@klever/connect-wallet` - Wallet implementations (uses this package for signing)
- `@klever/connect-transactions` - Transaction building (uses this package for signing)
- `@klever/connect-encoding` - Encoding utilities (address derivation)

## Contributing

See the main [Contributing Guide](../../CONTRIBUTING.md) for details.

## License

MIT
