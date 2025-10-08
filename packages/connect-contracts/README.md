# @klever/connect-contracts

Smart contract interaction package for Klever blockchain - ethers.js-like API for contract deployment, queries, and transactions.

## Installation

```bash
npm install @klever/connect-contracts
# or
pnpm add @klever/connect-contracts
# or
yarn add @klever/connect-contracts
```

## Overview

This package provides a comprehensive API for interacting with smart contracts on Klever blockchain, inspired by ethers.js:

- **Contract Class** - High-level abstraction for contract interactions
- **ABI-Based Encoding/Decoding** - Type-safe parameter encoding from ABI
- **ContractFactory** - Deploy contracts with type safety
- **Event Parsing** - Parse contract events from transaction logs
- **Receipt Parsing** - Extract deployment addresses and call results
- **Interface** - Low-level ABI utilities for advanced use cases

## Quick Start

### Deploy a Contract

```typescript
import { ContractFactory } from '@klever/connect-contracts'
import { NodeWallet } from '@klever/connect-wallet'
import contractAbi from './mycontract.abi.json'
import contractWasm from './mycontract.wasm'

const wallet = NodeWallet.fromPrivateKey(privateKey, provider)

// Create factory
const factory = new ContractFactory(contractAbi, contractWasm, wallet)

// Deploy contract
const contract = await factory.deploy(['constructor', 'args'], {
  vmType: 0, // Rust VM
  ownerAddress: wallet.address,
})

console.log('Contract deployed at:', contract.address)
```

### Call Contract Functions

```typescript
import { Contract } from '@klever/connect-contracts'

// Connect to deployed contract
const contract = new Contract(contractAddress, contractAbi, wallet)

// Call mutable function (sends transaction)
const tx = await contract.invoke('transfer', [recipientAddress, 1000n])
console.log('Transaction hash:', tx.hash)

// Wait for confirmation
const receipt = await tx.wait()
console.log('Transaction confirmed!')

// Call readonly function (query)
const balance = await contract.query('balanceOf', [ownerAddress])
console.log('Balance:', balance)
```

### Parse Contract Events

```typescript
import { EventParser } from '@klever/connect-contracts'

const eventParser = new EventParser(contractAbi)

// Parse events from transaction receipt
const events = eventParser.parseEvents(receipt)

for (const event of events) {
  console.log(`Event: ${event.name}`)
  console.log('Topics:', event.topics)
  console.log('Data:', event.data)
}
```

## API Reference

### Contract Class

The main class for interacting with deployed smart contracts.

#### Constructor

```typescript
new Contract(
  address: string,
  abi: ContractABI,
  signerOrProvider: Signer | Provider
)
```

**Parameters:**

- `address` - Contract address (Klever address starting with 'klv')
- `abi` - Contract ABI (JSON object with endpoints)
- `signerOrProvider` - Wallet for transactions or provider for queries

**Example:**

```typescript
import { Contract } from '@klever/connect-contracts'

const contract = new Contract(
  'klv1contract...',
  contractAbi,
  wallet, // or provider for read-only
)
```

#### `invoke(functionName: string, args: unknown[], options?: CallOptions): Promise<TransactionSubmitResult>`

Call a mutable contract function (sends transaction).

**Parameters:**

- `functionName` - Name of the function to call
- `args` - Array of function arguments
- `options` - Optional call options (value, gas, etc.)

**Returns:** Promise<TransactionSubmitResult> with transaction hash and wait() method

**Throws:** Error if function is readonly or doesn't exist

**Example:**

```typescript
// Simple call
const tx = await contract.invoke('transfer', [recipient, 1000n])

// With payment
const tx2 = await contract.invoke('buyItem', [itemId], {
  value: 100000000n, // 100 KLV in smallest units
})

// Wait for confirmation
const receipt = await tx.wait()
```

#### `query(functionName: string, args: unknown[]): Promise<unknown>`

Query a readonly contract function (does not send transaction).

**Parameters:**

- `functionName` - Name of the readonly function to query
- `args` - Array of function arguments

**Returns:** Promise<unknown> - Decoded return value(s)

**Throws:** Error if function is mutable or doesn't exist

**Example:**

```typescript
// Simple query
const balance = await contract.query('balanceOf', [address])
console.log('Balance:', balance)

// Query with multiple return values
const [name, symbol, decimals] = await contract.query('getInfo', [])
console.log(`Token: ${name} (${symbol}) - ${decimals} decimals`)
```

#### `getEvents(txHash: TransactionHash): Promise<ContractEvent[]>`

Get and parse contract events from a transaction.

**Parameters:**

- `txHash` - Transaction hash

**Returns:** Promise<ContractEvent[]> - Array of parsed events

**Example:**

```typescript
const events = await contract.getEvents(txHash)
for (const event of events) {
  console.log(`Event: ${event.name}`, event.data)
}
```

#### Properties

- `address: string` - Contract address
- `abi: ContractABI` - Contract ABI
- `interface: Interface` - Low-level ABI interface
- `signer: Signer | null` - Signer for transactions (null if provider-only)
- `provider: Provider` - Provider for queries and broadcasts

---

### ContractFactory Class

Deploy new contract instances with type safety.

#### Constructor

```typescript
new ContractFactory(
  abi: ContractABI,
  bytecode: Uint8Array | string,
  signer: Signer
)
```

**Parameters:**

- `abi` - Contract ABI
- `bytecode` - Contract bytecode (WASM file as Uint8Array or hex string)
- `signer` - Wallet for deployment transaction

**Example:**

```typescript
import { ContractFactory } from '@klever/connect-contracts'
import { readFileSync } from 'fs'

const wasm = readFileSync('./contract.wasm')
const factory = new ContractFactory(contractAbi, wasm, wallet)
```

#### `deploy(constructorArgs: unknown[], options?: DeployOptions): Promise<Contract>`

Deploy a new contract instance.

**Parameters:**

- `constructorArgs` - Array of constructor arguments
- `options` - Deployment options:
  - `vmType: number` - VM type (0 for Rust, 1 for C++)
  - `ownerAddress?: string` - Owner address (defaults to signer address)

**Returns:** Promise<Contract> - Contract instance at deployed address

**Example:**

```typescript
// Deploy with constructor args
const contract = await factory.deploy(['TokenName', 'TKN', 18], {
  vmType: 0,
  ownerAddress: wallet.address,
})

console.log('Deployed at:', contract.address)

// Use deployed contract
const tx = await contract.invoke('mint', [recipient, 1000000n])
```

#### `getDeployedAddress(txHash: TransactionHash): Promise<string>`

Get the deployed contract address from a deployment transaction.

**Parameters:**

- `txHash` - Deployment transaction hash

**Returns:** Promise<string> - Deployed contract address

**Example:**

```typescript
const address = await factory.getDeployedAddress(deployTxHash)
console.log('Contract address:', address)
```

---

### Interface Class

Low-level ABI utilities for encoding/decoding.

#### Constructor

```typescript
new Interface(abi: ContractABI)
```

**Parameters:**

- `abi` - Contract ABI

**Example:**

```typescript
import { Interface } from '@klever/connect-contracts'

const iface = new Interface(contractAbi)
```

#### `getEndpoint(name: string): ABIEndpoint | undefined`

Get endpoint definition from ABI.

**Parameters:**

- `name` - Function name

**Returns:** ABIEndpoint or undefined if not found

**Example:**

```typescript
const endpoint = iface.getEndpoint('transfer')
if (endpoint) {
  console.log('Inputs:', endpoint.inputs)
  console.log('Outputs:', endpoint.outputs)
  console.log('Mutability:', endpoint.mutability)
}
```

#### `encodeFunctionCall(functionName: string, args: unknown[]): string`

Encode function call to hex string.

**Parameters:**

- `functionName` - Name of the function
- `args` - Array of function arguments

**Returns:** Hex-encoded function call data

**Example:**

```typescript
const callData = iface.encodeFunctionCall('transfer', [recipient, 1000n])
console.log('Call data:', callData) // "transfer@abc123...@03e8"
```

#### `decodeFunctionResult(functionName: string, data: string): unknown`

Decode function result from hex string.

**Parameters:**

- `functionName` - Name of the function
- `data` - Hex-encoded result data

**Returns:** Decoded result value(s)

**Example:**

```typescript
const result = iface.decodeFunctionResult('balanceOf', returnData)
console.log('Balance:', result)
```

---

### EventParser Class

Parse contract events from transaction logs.

#### Constructor

```typescript
new EventParser(abi: ContractABI)
```

**Parameters:**

- `abi` - Contract ABI with event definitions

**Example:**

```typescript
import { EventParser } from '@klever/connect-contracts'

const parser = new EventParser(contractAbi)
```

#### `parseEvents(logs: TransactionLog[]): ContractEvent[]`

Parse events from transaction logs.

**Parameters:**

- `logs` - Array of transaction logs from receipt

**Returns:** Array of parsed ContractEvent objects

**Example:**

```typescript
const events = parser.parseEvents(receipt.logs)

for (const event of events) {
  if (event.name === 'Transfer') {
    console.log(`Transfer from ${event.args.from} to ${event.args.to}`)
    console.log(`Amount: ${event.args.amount}`)
  }
}
```

#### `getEventIdentifiers(): Map<string, string>`

Get map of event identifiers to event names.

**Returns:** Map<string, string> - Event identifier to name mapping

**Example:**

```typescript
const identifiers = parser.getEventIdentifiers()
console.log('Event identifiers:', Array.from(identifiers.keys()))
```

---

### Receipt Parsing Utilities

#### `parseDeployReceipt(receipt: TransactionReceipt): DeployReceiptData`

Parse deployment receipt to extract contract address.

**Parameters:**

- `receipt` - Transaction receipt from deployment

**Returns:** DeployReceiptData with contract address

**Example:**

```typescript
import { parseDeployReceipt } from '@klever/connect-contracts'

const { contractAddress } = parseDeployReceipt(receipt)
console.log('Deployed at:', contractAddress)
```

#### `parseCallReceipt(receipt: TransactionReceipt): CallReceiptData`

Parse contract call receipt to extract return values.

**Parameters:**

- `receipt` - Transaction receipt from contract call

**Returns:** CallReceiptData with return data and status

**Example:**

```typescript
import { parseCallReceipt } from '@klever/connect-contracts'

const { returnData, returnCode, gasUsed } = parseCallReceipt(receipt)
console.log('Return data:', returnData)
console.log('Gas used:', gasUsed)
```

---

## ABI Format

Klever smart contracts use JSON ABI format similar to MultiversX:

```json
{
  "buildInfo": {
    "contractCrate": {
      "name": "mycontract",
      "version": "1.0.0"
    }
  },
  "endpoints": [
    {
      "name": "transfer",
      "mutability": "mutable",
      "inputs": [
        {
          "name": "to",
          "type": "Address"
        },
        {
          "name": "amount",
          "type": "BigUint"
        }
      ],
      "outputs": []
    },
    {
      "name": "balanceOf",
      "mutability": "readonly",
      "inputs": [
        {
          "name": "address",
          "type": "Address"
        }
      ],
      "outputs": [
        {
          "type": "BigUint"
        }
      ]
    }
  ]
}
```

### Supported Types

- **Primitive**: `u8`, `u16`, `u32`, `u64`, `BigUint`, `bool`
- **Bytes**: `bytes`, `Address` (32 bytes)
- **Strings**: `utf-8 string`, `TokenIdentifier`
- **Collections**: `List<T>`, `Option<T>`
- **Custom**: Structs and enums defined in ABI

---

## Common Use Cases

### Example 1: ERC20-like Token Contract

```typescript
import { Contract } from '@klever/connect-contracts'
import tokenAbi from './token.abi.json'

const token = new Contract(tokenAddress, tokenAbi, wallet)

// Check balance
const balance = await token.query('balanceOf', [myAddress])
console.log('Balance:', balance)

// Transfer tokens
const tx = await token.invoke('transfer', [recipientAddress, 1000000n])
await tx.wait()

// Approve spending
await token.invoke('approve', [spenderAddress, 5000000n])
```

### Example 2: NFT Contract with Events

```typescript
import { Contract, EventParser } from '@klever/connect-contracts'
import nftAbi from './nft.abi.json'

const nft = new Contract(nftAddress, nftAbi, wallet)

// Mint NFT
const tx = await nft.invoke('mint', [ownerAddress, tokenId, metadataUri])
const receipt = await tx.wait()

// Parse events
const eventParser = new EventParser(nftAbi)
const events = eventParser.parseEvents(receipt.logs)

for (const event of events) {
  if (event.name === 'Mint') {
    console.log('NFT minted:', event.args.tokenId)
    console.log('Owner:', event.args.owner)
  }
}
```

### Example 3: Payable Contract Functions

```typescript
import { Contract } from '@klever/connect-contracts'
import { parseKLV } from '@klever/connect-core'
import gameAbi from './game.abi.json'

const game = new Contract(gameAddress, gameAbi, wallet)

// Call payable function with KLV
const tx = await game.invoke(
  'bet',
  [
    1, // BetType.UNDER
    50, // Number
  ],
  {
    value: parseKLV('10'), // Bet 10 KLV
  },
)

const receipt = await tx.wait()

// Query result
const lastBet = await game.query('getLastBet', [wallet.address])
console.log('Last bet result:', lastBet)
```

### Example 4: Contract Deployment with Constructor

```typescript
import { ContractFactory } from '@klever/connect-contracts'
import { readFileSync } from 'fs'
import tokenAbi from './token.abi.json'

// Load WASM bytecode
const bytecode = readFileSync('./token.wasm')

// Create factory
const factory = new ContractFactory(tokenAbi, bytecode, wallet)

// Deploy with constructor args
const token = await factory.deploy(
  [
    'MyToken', // name
    'MTK', // symbol
    18, // decimals
    1000000000000000000000n, // initial supply (1000 tokens with 18 decimals)
  ],
  {
    vmType: 0, // Rust VM
  },
)

console.log('Token deployed at:', token.address)

// Use deployed contract immediately
const totalSupply = await token.query('totalSupply', [])
console.log('Total supply:', totalSupply)
```

### Example 5: Read-Only Provider (No Signer)

```typescript
import { Contract } from '@klever/connect-contracts'
import { KleverProvider } from '@klever/connect-provider'

// Provider-only contract (no transactions, queries only)
const provider = new KleverProvider('mainnet')
const contract = new Contract(contractAddress, contractAbi, provider)

// Can only query readonly functions
const result = await contract.query('getInfo', [])

// Cannot call mutable functions (will throw error)
// await contract.invoke('transfer', [...]) // ERROR: No signer
```

---

## Encoding & Decoding

### Manual Parameter Encoding

For advanced use cases, you can manually encode parameters:

```typescript
import { encodeAddress, encodeU64, encodeString, contractParam } from '@klever/connect-contracts'

// Encode individual parameters
const addressHex = encodeAddress('klv1abc...')
const amountHex = encodeU64(1000n)
const nameHex = encodeString('TokenName')

// Build call data manually
const callData = `transfer@${addressHex}@${amountHex}`
```

### Manual Result Decoding

```typescript
import { decodeAddress, decodeU64, decodeString, contractResult } from '@klever/connect-contracts'

// Decode results manually
const returnData = ['0abc...', '03e8']
const address = decodeAddress(returnData[0])
const amount = decodeU64(returnData[1])
```

### ABI-Aware Encoding (Recommended)

```typescript
import { ABIEncoder, ABIDecoder } from '@klever/connect-contracts'

const encoder = new ABIEncoder(contractAbi)
const decoder = new ABIDecoder(contractAbi)

// Encode with type validation
const encoded = encoder.encodeEndpoint('transfer', [recipient, 1000n])

// Decode with type information
const decoded = decoder.decodeEndpoint('balanceOf', returnData)
```

---

## Error Handling

```typescript
import { Contract, ContractReceiptError, ParseError } from '@klever/connect-contracts'

try {
  const tx = await contract.invoke('transfer', [recipient, 1000n])
  const receipt = await tx.wait()

  // Check if contract execution failed
  if (receipt.status !== 'success') {
    console.error('Transaction failed:', receipt.returnMessage)
  }
} catch (error) {
  if (error instanceof ContractReceiptError) {
    console.error('Contract error:', error.message)
    console.error('Return code:', error.returnCode)
  } else if (error instanceof ParseError) {
    console.error('ABI parsing error:', error.message)
  } else {
    console.error('Unexpected error:', error)
  }
}
```

---

## TypeScript Support

Fully typed with TypeScript definitions:

```typescript
import type {
  ContractABI,
  ABIEndpoint,
  ABIParameter,
  ContractEvent,
  DecodedResult,
} from '@klever/connect-contracts'

// Type-safe ABI
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

---

## Examples

See the [examples](./examples/) folder for complete contract examples:

- **[Dice Contract](./examples/dice/)** - Gambling game with betting (ABI, WASM, tests)

---

## Performance

- **ABI Parsing**: ~1ms (one-time per contract)
- **Parameter Encoding**: ~0.1ms per call
- **Parameter Decoding**: ~0.1ms per result
- **Event Parsing**: ~1ms per 10 events

---

## Related Packages

- `@klever/connect-provider` - Network communication (required for contract queries)
- `@klever/connect-wallet` - Wallet implementations (required for mutable calls)
- `@klever/connect-transactions` - Transaction building (used internally)
- `@klever/connect-encoding` - Proto encoding (used internally)

---

## Differences from ethers.js

If you're familiar with ethers.js, here are the key differences:

| Feature          | ethers.js                     | @klever/connect-contracts               |
| ---------------- | ----------------------------- | --------------------------------------- |
| Function calls   | `contract.functionName(args)` | `contract.invoke('functionName', args)` |
| Readonly queries | `contract.functionName(args)` | `contract.query('functionName', args)`  |
| ABI format       | Solidity JSON                 | Klever/MultiversX JSON                  |
| Encoding         | RLP/ABI                       | Protocol Buffers + Custom               |
| Address format   | Hex (0x...)                   | Bech32 (klv...)                         |

**Why explicit invoke/query?**

- Clear distinction between transactions (cost money) and queries (free)
- Prevents accidental transaction sends when you meant to query
- Better for developer experience on non-EVM chains

---

## Contributing

See the main [Contributing Guide](../../CONTRIBUTING.md) for details.

---

## License

MIT
