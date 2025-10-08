# @klever/connect-encoding

Encoding, decoding, and Protocol Buffer utilities for Klever Connect SDK.

## Installation

```bash
npm install @klever/connect-encoding
# or
pnpm add @klever/connect-encoding
# or
yarn add @klever/connect-encoding
```

## Overview

This package provides:

- **Protocol Buffer** encoding/decoding for Klever blockchain transactions
- **Address encoding** utilities (Bech32, Base58, Hex)
- **Data format conversions** (Base64, Hex)
- **Proto type definitions** for all transaction types
- **ABI interfaces** for smart contract interactions
- **Hashing utilities** (Blake2b)

## Features

### 📦 Protocol Buffer Support

Access to all Klever blockchain proto definitions:

```typescript
import { proto, Transaction, TXContract, ContractType } from '@klever/connect-encoding'

// Create a transfer contract
const transfer = proto.TransferContract.create({
  receiver: receiverBytes,
  amount: 1000000n,
  kda: 'KLV',
})
```

### 🔐 Address Encoding

Convert between different address formats:

```typescript
import { bech32Encode, bech32Decode, hexEncode, base58Encode } from '@klever/connect-encoding'

// Encode address to Bech32 format
const address = bech32Encode(publicKeyBytes) // 'klv1...'

// Decode Bech32 address
const { prefix, data } = bech32Decode('klv1abc...')
console.log(prefix) // 'klv'
console.log(data) // Uint8Array(32)

// Convert to hex
const hex = hexEncode(data)

// Convert to base58
const base58 = base58Encode(data)
```

### 🔄 Data Format Conversions

```typescript
import { hexEncode, hexDecode, base64Encode, base64Decode } from '@klever/connect-encoding'

// Hex encoding/decoding
const hex = hexEncode(new Uint8Array([1, 2, 3])) // '010203'
const bytes = hexDecode('010203') // Uint8Array([1, 2, 3])

// Base64 encoding/decoding
const base64 = base64Encode(new Uint8Array([1, 2, 3])) // 'AQID'
const bytes2 = base64Decode('AQID') // Uint8Array([1, 2, 3])
```

### 🔨 Hashing Utilities

```typescript
import { hashBlake2b } from '@klever/connect-encoding'

// Hash data with Blake2b
const hash = hashBlake2b(new Uint8Array([1, 2, 3]))
console.log(hash) // 32-byte hash
```

## API Reference

### Address Encoding Functions

#### `bech32Encode(data: Uint8Array, prefix?: string): string`

Encode bytes to Bech32 address format (Klever's address format).

**Parameters:**

- `data` - Public key bytes (must be 32 bytes)
- `prefix` - Address prefix (default: `'klv'`)

**Returns:** Bech32-encoded address string

**Example:**

```typescript
const address = bech32Encode(publicKeyBytes)
// 'klv1fpwjz234gy8aaae3gx0e8q9f52vymzzn3z5q0s5h60pvktzx0n0qwvtux5'
```

#### `bech32Decode(address: string): { prefix: string; data: Uint8Array }`

Decode Bech32 address to bytes.

**Parameters:**

- `address` - Bech32-encoded address string

**Returns:** Object with `prefix` and `data` (32-byte Uint8Array)

**Throws:** Error if address length is invalid

**Example:**

```typescript
const { prefix, data } = bech32Decode('klv1abc...')
```

#### `hexEncode(data: Uint8Array): string`

Convert bytes to hexadecimal string.

**Parameters:**

- `data` - Bytes to encode

**Returns:** Hexadecimal string (lowercase, no `0x` prefix)

**Example:**

```typescript
const hex = hexEncode(new Uint8Array([255, 128, 0])) // 'ff8000'
```

#### `hexDecode(hex: string): Uint8Array`

Convert hexadecimal string to bytes.

**Parameters:**

- `hex` - Hexadecimal string (with or without `0x` prefix)

**Returns:** Uint8Array of decoded bytes

**Throws:** Error if hex string has odd length

**Example:**

```typescript
const bytes = hexDecode('ff8000') // Uint8Array([255, 128, 0])
```

#### `base58Encode(data: Uint8Array): string`

Encode bytes to Base58 string.

**Parameters:**

- `data` - Bytes to encode

**Returns:** Base58-encoded string

**Example:**

```typescript
const base58 = base58Encode(new Uint8Array([1, 2, 3]))
```

#### `base58Decode(str: string): Uint8Array`

Decode Base58 string to bytes.

**Parameters:**

- `str` - Base58-encoded string

**Returns:** Uint8Array of decoded bytes

**Example:**

```typescript
const bytes = base58Decode('Ldp')
```

#### `base64Encode(data: Uint8Array): string`

Encode bytes to Base64 string.

**Parameters:**

- `data` - Bytes to encode

**Returns:** Base64-encoded string

**Example:**

```typescript
const base64 = base64Encode(new Uint8Array([1, 2, 3])) // 'AQID'
```

#### `base64Decode(str: string): Uint8Array`

Decode Base64 string to bytes.

**Parameters:**

- `str` - Base64-encoded string

**Returns:** Uint8Array of decoded bytes

**Example:**

```typescript
const bytes = base64Decode('AQID') // Uint8Array([1, 2, 3])
```

### Hashing Functions

#### `hashBlake2b(data: Uint8Array): Uint8Array`

Hash data using Blake2b-256 algorithm.

**Parameters:**

- `data` - Data to hash

**Returns:** 32-byte hash as Uint8Array

**Example:**

```typescript
import { hashBlake2b } from '@klever/connect-encoding'

const hash = hashBlake2b(new Uint8Array([1, 2, 3]))
console.log(hash.length) // 32
```

### Protocol Buffer Types

#### Transaction Types

```typescript
import {
  Transaction,
  TXContract,
  ContractType,
  TransferContract,
  FreezeContract,
  UnfreezeContract,
  DelegateContract,
  UndelegateContract,
  WithdrawContract,
  ClaimContract,
  SmartContract,
} from '@klever/connect-encoding'
```

#### Type Interfaces

```typescript
import type {
  ITransaction,
  ITXContract,
  ITransferContract,
  IFreezeContract,
  ISmartContract,
} from '@klever/connect-encoding'
```

#### Contract Types Enum

```typescript
import { ContractType } from '@klever/connect-encoding'

ContractType.TransferContractType // 0
ContractType.FreezeContractType // 3
ContractType.DelegateContractType // 5
ContractType.SmartContractType // 19
// ... and more
```

## Protocol Buffer Usage

### Creating Transactions

```typescript
import { proto, Transaction, TXContract, ContractType } from '@klever/connect-encoding'

// Create a transaction
const tx = proto.Transaction.create({
  raw: {
    nonce: 1,
    sender: senderBytes,
    contracts: [
      {
        type: ContractType.TransferContractType,
        payload: proto.TransferContract.encode({
          receiver: receiverBytes,
          amount: 1000000n,
          kda: 'KLV',
        }).finish(),
      },
    ],
  },
  signature: signatureBytes,
})

// Encode to bytes
const bytes = proto.Transaction.encode(tx).finish()

// Decode from bytes
const decoded = proto.Transaction.decode(bytes)
```

### Working with Contracts

```typescript
import { proto, ContractType } from '@klever/connect-encoding'

// Transfer contract
const transfer = proto.TransferContract.create({
  receiver: new Uint8Array(32),
  amount: 1000000n,
  kda: 'KLV',
})

// Freeze contract
const freeze = proto.FreezeContract.create({
  amount: 100000000n,
  kda: 'KLV',
})

// Delegate contract
const delegate = proto.DelegateContract.create({
  receiver: validatorBytes,
  bucketId: bucketIdBytes,
})

// Smart contract call
const smartContract = proto.SmartContract.create({
  address: contractBytes,
  callValue: 0n,
  callData: callDataBytes,
})
```

## ABI Interfaces

For smart contract interactions:

```typescript
import type { ContractABI, ABIEndpoint, ABIParameter } from '@klever/connect-encoding'

const abi: ContractABI = {
  endpoints: [
    {
      name: 'transfer',
      mutability: 'mutable',
      inputs: [
        { name: 'to', type: 'Address' },
        { name: 'amount', type: 'BigUint' },
      ],
      outputs: [],
    },
  ],
}
```

## Common Use Cases

### Example 1: Encode Address from Public Key

```typescript
import { bech32Encode } from '@klever/connect-encoding'

function publicKeyToAddress(publicKey: Uint8Array): string {
  return bech32Encode(publicKey, 'klv')
}

const address = publicKeyToAddress(myPublicKey)
console.log(address) // 'klv1...'
```

### Example 2: Transaction Hash

```typescript
import { proto, hashBlake2b, hexEncode } from '@klever/connect-encoding'

function getTransactionHash(tx: proto.Transaction): string {
  const bytes = proto.Transaction.encode(tx).finish()
  const hash = hashBlake2b(bytes)
  return hexEncode(hash)
}
```

### Example 3: Format Conversion Pipeline

```typescript
import { bech32Decode, hexEncode, base64Encode } from '@klever/connect-encoding'

// Convert Bech32 address to different formats
const address = 'klv1fpwjz234gy8aaae3gx0e8q9f52vymzzn3z5q0s5h60pvktzx0n0qwvtux5'
const { data } = bech32Decode(address)

const hex = hexEncode(data)
const base64 = base64Encode(data)

console.log('Hex:', hex)
console.log('Base64:', base64)
```

## TypeScript Support

Fully typed with TypeScript definitions for all proto types and functions.

```typescript
import type { ITransaction, ITransferContract, IFreezeContract } from '@klever/connect-encoding'

// All types are inferred automatically
const transfer: ITransferContract = {
  receiver: new Uint8Array(32),
  amount: 1000000n,
  kda: 'KLV',
}
```

## Performance

- **Encoding**: Fast protobuf encoding using `protobufjs`
- **Hashing**: Native Blake2b implementation
- **Address encoding**: Efficient Bech32 encoding using `@scure/base`

## Related Packages

- `@klever/connect-transactions` - Transaction building (uses this package for encoding)
- `@klever/connect-crypto` - Cryptographic operations (uses hashing from this package)
- `@klever/connect-provider` - Network communication (uses proto types from this package)

## Contributing

See the main [Contributing Guide](../../CONTRIBUTING.md) for details.

## License

MIT
