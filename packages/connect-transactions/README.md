# @klever/connect-transactions

Transaction building for Klever Connect SDK - build and sign transactions offline.

## Installation

```bash
npm install @klever/connect-transactions
```

## Features

- **Chainable API** - Fluent transaction building with method chaining for intuitive transaction construction
- **Offline-First** - Build transactions without network connectivity using `buildProto()` for air-gapped signing
- **Online Building** - Node-assisted building with automatic fee calculation and nonce management using `build()`
- **Type Safe** - Full TypeScript support with branded types, compile-time validation, and IntelliSense
- **All Transaction Types** - Support for 20+ transaction types including transfers, staking, governance, assets, NFTs, marketplace, and smart contracts
- **Fee Management** - Automatic fee calculation by node or manual control for offline building
- **Nonce Management** - Automatic nonce fetching from the network or manual specification for batch transactions
- **Proto Encoding** - Built-in protobuf encoding/decoding compatible with Klever blockchain protocol
- **Multiple Contracts** - Support for multiple contracts in a single transaction (e.g., transfer + freeze + delegate)
- **Performance Optimized** - Lightning-fast transaction building (~0.003ms) and proto encoding (~0.0002ms)
- **Helper Functions** - Convenient helper functions for common operations and amount conversions

## Quick Start

### Basic Transfer (Node-Assisted)

```typescript
import { TransactionBuilder } from '@klever/connect-transactions'
import { KleverProvider } from '@klever/connect-provider'

const provider = new KleverProvider({ network: 'mainnet' })

// Build a transfer transaction (node handles nonce and fees)
const tx = await TransactionBuilder.create(provider)
  .sender('klv1...')
  .transfer({
    receiver: 'klv1...',
    amount: '1000000', // 1 KLV
  })
  .build()

// Sign with private key
await tx.sign(privateKey)

// Broadcast
const txHash = await provider.sendRawTransaction(tx.toHex())
```

### Offline Building

```typescript
import { TransactionBuilder } from '@klever/connect-transactions'

// Build transaction entirely offline (no network required)
const tx = TransactionBuilder.create()
  .sender('klv1...')
  .nonce(123) // Must provide nonce manually
  .transfer({
    receiver: 'klv1...',
    amount: '1000000',
  })
  .buildProto({
    chainId: '100', // Mainnet
    fees: {
      kAppFee: 500000,
      bandwidthFee: 100000,
    },
  })

await tx.sign(privateKey)
// Later: broadcast tx.toHex()
```

## Building Modes Comparison

The SDK provides three distinct building modes, each optimized for different use cases:

| Feature                       | `build()`                    | `buildProto()`                       | `buildRequest()`               |
| ----------------------------- | ---------------------------- | ------------------------------------ | ------------------------------ |
| **Network Required**          | ✅ Yes (provider required)   | ❌ No (fully offline)                | ❌ No (returns JSON)           |
| **Nonce Management**          | ✅ Automatic from network    | ⚙️ Manual (you provide)              | ⚙️ Manual (you provide)        |
| **Fee Calculation**           | ✅ Automatic by node         | ⚙️ Manual (you provide)              | ✅ Automatic by node (later)   |
| **Proto Encoding**            | ✅ Done by node              | ✅ Done client-side                  | ❌ No (JSON object)            |
| **Validation**                | ✅ Yes (by node)             | ⚠️ Limited (client-side)             | ❌ No                          |
| **Performance**               | ~100-300ms (network call)    | ~0.003ms (instant)                   | ~0.001ms (instant)             |
| **Best For**                  | Standard dApps, wallets      | Hardware wallets, air-gapped signing | Custom integrations, debugging |
| **Security**                  | Good (requires internet)     | Excellent (no network exposure)      | Good (inspect before sending)  |
| **Transaction Ready to Sign** | ✅ Yes (returns Transaction) | ✅ Yes (returns Transaction)         | ❌ No (needs node processing)  |
| **Returns**                   | `Promise<Transaction>`       | `Transaction`                        | `BuildTransactionRequest`      |

### 1. Node-Assisted Building (`build()`)

**Best for:** Standard applications with internet connectivity, production dApps, wallets

**Use when:** You want the easiest experience and have network connectivity

**Advantages:**

- Automatic nonce fetching from the blockchain
- Automatic fee calculation based on contract complexity
- Transaction validation before encoding
- Error checking and helpful messages
- Production-ready with minimal code

**Disadvantages:**

- Requires internet connection and working provider
- Slightly slower due to network latency (~100-300ms)
- Less control over transaction parameters

```typescript
const provider = new KleverProvider({ network: 'mainnet' })

const tx = await TransactionBuilder.create(provider)
  .sender('klv1...')
  .transfer({ receiver: 'klv1...', amount: '1000000' })
  .build() // Node handles everything

// Transaction is ready to sign and broadcast
await tx.sign(privateKey)
const hash = await provider.sendRawTransaction(tx.toHex())
```

### 2. Offline Building (`buildProto()`)

**Best for:** Air-gapped signing, hardware wallets, maximum security, batch transactions

**Use when:** Security is paramount, or you're building transactions in advance

**Advantages:**

- Zero network latency (~0.003ms building time)
- Works completely offline (perfect for air-gapped systems)
- Full control over every transaction parameter
- Maximum security (no network exposure during signing)
- Ideal for hardware wallet integration

**Disadvantages:**

- Must manually fetch and manage nonce
- Must manually calculate or estimate fees
- No automatic validation (easy to create invalid transactions)
- Requires more code and blockchain knowledge

**Fee Estimation:**

- KAppFee: Base fee for contract type (typically 500000-1000000)
- BandwidthFee: Based on transaction size (typically 100000-500000)
- Use previous transaction fees as reference or query node's fee table

```typescript
// Fetch nonce first (can be done earlier)
const account = await provider.getAccount('klv1...')

// Build completely offline
const tx = TransactionBuilder.create()
  .sender('klv1...')
  .nonce(account.nonce)
  .transfer({ receiver: 'klv1...', amount: '1000000' })
  .buildProto({
    chainId: '100', // Mainnet
    fees: {
      kAppFee: 500000, // Base fee
      bandwidthFee: 100000, // Size-based fee
    },
  })

// Sign offline (can be done on air-gapped machine)
await tx.sign(privateKey)

// Later: broadcast to network
const hex = tx.toHex()
```

### 3. Request Building (`buildRequest()`)

**Best for:** Custom integrations, debugging, API development, testing

**Use when:** You need to inspect or modify the request before building

**Advantages:**

- Returns plain JSON object (easy to inspect)
- Can be modified before sending to node
- Useful for debugging transaction issues
- Allows custom processing or logging
- Can be sent to any node endpoint

**Disadvantages:**

- Not ready for signing (needs node processing)
- Requires additional HTTP call to node
- Two-step process (build request → send to node)

```typescript
// Create request object
const request = TransactionBuilder.create()
  .sender('klv1...')
  .transfer({ receiver: 'klv1...', amount: '1000000' })
  .buildRequest()

// Inspect the request
console.log(JSON.stringify(request, null, 2))

// Modify if needed
request.nonce = 150

// Send to node endpoint manually
const response = await fetch('https://api.mainnet.klever.finance/v1.0/transaction/build', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(request),
})

const data = await response.json()
const tx = Transaction.fromObject(data.result)

// Now ready to sign
await tx.sign(privateKey)
```

### When to Use Each Mode

**Use `build()` if:**

- Building a standard dApp or wallet
- You have reliable internet connectivity
- You want automatic nonce and fee management
- You prefer simpler code with fewer steps

**Use `buildProto()` if:**

- Integrating with hardware wallets (Ledger, Trezor)
- Building transactions on air-gapped computers
- Creating batch transactions with sequential nonces
- Maximum security is required
- You need predictable build times (no network variance)

**Use `buildRequest()` if:**

- Developing custom blockchain tools
- Debugging transaction issues
- Building transaction explorers
- Need to inspect or modify requests
- Integrating with custom node infrastructure

## Transaction Types

The SDK supports all Klever blockchain transaction types. Each type has a corresponding builder method for easy transaction construction.

### Transfer Operations (Type 0)

Transfer KLV, KDA tokens, or NFTs between accounts. Supports royalty payments for NFT transfers.

```typescript
// Basic KLV transfer
const tx = await TransactionBuilder.create(provider)
  .sender('klv1...')
  .transfer({
    receiver: 'klv1recipient...',
    amount: '1000000', // 1 KLV
  })
  .build()

// Transfer custom KDA token
const tx = await TransactionBuilder.create(provider)
  .sender('klv1...')
  .transfer({
    receiver: 'klv1recipient...',
    amount: '5000000',
    kda: 'MYTOKEN-ABCD', // Custom token
  })
  .build()

// Transfer NFT with royalties
const tx = await TransactionBuilder.create(provider)
  .sender('klv1...')
  .transfer({
    receiver: 'klv1recipient...',
    amount: '1',
    kda: 'NFT-COLLECTION/NONCE-1',
    kdaRoyalties: '100000', // Royalties in KDA
    klvRoyalties: '50000', // Royalties in KLV
  })
  .build()

// Multiple transfers in one transaction
const tx = await TransactionBuilder.create(provider)
  .sender('klv1...')
  .transfer({ receiver: 'klv1alice...', amount: '1000000' })
  .transfer({ receiver: 'klv1bob...', amount: '2000000' })
  .transfer({ receiver: 'klv1charlie...', amount: '3000000', kda: 'MYTOKEN-ABCD' })
  .build()
```

### Staking Operations

#### Freeze (Type 4)

Lock KLV or KDA tokens to create a staking bucket. Frozen tokens can be delegated to validators or used for governance.

```typescript
// Freeze KLV for staking
const tx = await TransactionBuilder.create(provider)
  .sender('klv1...')
  .freeze({
    amount: '5000000', // 5 KLV
  })
  .build()

// Freeze custom KDA token
const tx = await TransactionBuilder.create(provider)
  .sender('klv1...')
  .freeze({
    amount: '1000000',
    kda: 'MYTOKEN-ABCD',
  })
  .build()
```

#### Unfreeze (Type 5)

Unlock frozen tokens. After unfreezing, tokens enter an unlock period before becoming available.

```typescript
// Unfreeze KLV bucket
const tx = await TransactionBuilder.create(provider)
  .sender('klv1...')
  .unfreeze({
    kda: 'KLV',
    bucketId: 'bucket-hash-123', // Required for KLV
  })
  .build()

// Unfreeze KDA token
const tx = await TransactionBuilder.create(provider)
  .sender('klv1...')
  .unfreeze({
    kda: 'MYTOKEN-ABCD',
  })
  .build()
```

#### Delegate (Type 6)

Assign a frozen bucket to a validator for staking rewards.

```typescript
// Delegate specific bucket
const tx = await TransactionBuilder.create(provider)
  .sender('klv1...')
  .delegate({
    receiver: 'klv1validator...', // Validator address
    bucketId: 'bucket-hash-123',
  })
  .build()

// Delegate all available buckets
const tx = await TransactionBuilder.create(provider)
  .sender('klv1...')
  .delegate({
    receiver: 'klv1validator...',
  })
  .build()
```

#### Undelegate (Type 7)

Remove delegation from a validator, returning the bucket to your control.

```typescript
const tx = await TransactionBuilder.create(provider)
  .sender('klv1...')
  .undelegate({
    bucketId: 'bucket-hash-123',
  })
  .build()
```

#### Withdraw (Type 8)

Withdraw staking rewards, unlocked assets, or other withdrawable amounts.

```typescript
// Withdraw staking rewards
const tx = await TransactionBuilder.create(provider)
  .sender('klv1...')
  .withdraw({
    withdrawType: 0, // 0 = Staking rewards
  })
  .build()

// Withdraw specific KDA amount
const tx = await TransactionBuilder.create(provider)
  .sender('klv1...')
  .withdraw({
    withdrawType: 0,
    kda: 'MYTOKEN-ABCD',
    amount: '1000000',
  })
  .build()

// Withdraw FPR rewards
const tx = await TransactionBuilder.create(provider)
  .sender('klv1...')
  .withdraw({
    withdrawType: 1, // 1 = FPR rewards
  })
  .build()
```

#### Claim (Type 9)

Claim rewards, airdrops, or allocations.

```typescript
// Claim staking rewards
const tx = await TransactionBuilder.create(provider)
  .sender('klv1...')
  .claim({
    claimType: 0, // 0 = Staking rewards
  })
  .build()

// Claim market rewards
const tx = await TransactionBuilder.create(provider)
  .sender('klv1...')
  .claim({
    claimType: 1, // 1 = Market rewards
  })
  .build()

// Claim specific allocation
const tx = await TransactionBuilder.create(provider)
  .sender('klv1...')
  .claim({
    claimType: 0,
    id: 'allocation-id-123',
  })
  .build()
```

### Asset Management

#### Create Asset (Type 1)

Create fungible tokens (FT) or non-fungible tokens (NFT).

```typescript
// Create fungible token
const tx = await TransactionBuilder.create(provider)
  .sender('klv1...')
  .createAsset({
    type: 0, // 0 = Fungible Token
    name: 'My Token',
    ticker: 'MTK',
    ownerAddress: 'klv1...',
    precision: 6, // 6 decimal places
    maxSupply: '1000000000000', // 1 million tokens
    initialSupply: '100000000000', // 100k tokens initially
    properties: {
      canMint: true,
      canBurn: true,
      canPause: true,
      canWipe: false,
      canFreeze: false,
      canChangeOwner: true,
      canAddRoles: true,
    },
  })
  .build()

// Create NFT collection
const tx = await TransactionBuilder.create(provider)
  .sender('klv1...')
  .createAsset({
    type: 1, // 1 = NFT
    name: 'My NFT Collection',
    ticker: 'MYNFT',
    ownerAddress: 'klv1...',
    precision: 0, // NFTs have no decimals
    maxSupply: 0, // Unlimited
    logo: 'https://example.com/logo.png',
    uris: {
      website: 'https://mynft.com',
      twitter: 'https://twitter.com/mynft',
    },
    royalties: {
      address: 'klv1royalty...', // Royalty recipient
      transferPercentage: [{ amount: 0, percentage: 5 }], // 5% royalty
    },
    properties: {
      canMint: true,
      canBurn: false,
      canPause: false,
    },
  })
  .build()
```

#### Asset Trigger (Type 11)

Mint, burn, pause, resume, or wipe assets.

```typescript
// Mint NFT
const tx = await TransactionBuilder.create(provider)
  .sender('klv1...')
  .addContract({
    contractType: 11,
    triggerType: 0, // 0 = Mint
    assetId: 'MYNFT-ABCD',
    receiver: 'klv1recipient...',
    uris: {
      image: 'ipfs://QmXyz...',
      metadata: 'ipfs://QmAbc...',
    },
    mime: 'image/png',
  })
  .build()

// Burn tokens
const tx = await TransactionBuilder.create(provider)
  .sender('klv1...')
  .addContract({
    contractType: 11,
    triggerType: 1, // 1 = Burn
    assetId: 'MYTOKEN-ABCD',
    amount: '1000000',
  })
  .build()

// Pause asset (admin only)
const tx = await TransactionBuilder.create(provider)
  .sender('klv1...')
  .addContract({
    contractType: 11,
    triggerType: 3, // 3 = Pause
    assetId: 'MYTOKEN-ABCD',
  })
  .build()

// Resume asset (admin only)
const tx = await TransactionBuilder.create(provider)
  .sender('klv1...')
  .addContract({
    contractType: 11,
    triggerType: 4, // 4 = Resume
    assetId: 'MYTOKEN-ABCD',
  })
  .build()
```

### Validator Operations

#### Create Validator (Type 2)

Register a new validator node to participate in network consensus.

```typescript
const tx = await TransactionBuilder.create(provider)
  .sender('klv1...')
  .createValidator({
    blsPublicKey: '0xabcd1234...', // BLS key for signing
    ownerAddress: 'klv1owner...',
    commission: 10, // 10% commission
    canDelegate: true,
    maxDelegationAmount: '10000000000', // Optional limit
    name: 'My Validator',
    logo: 'https://validator.com/logo.png',
    uris: {
      website: 'https://validator.com',
      twitter: 'https://twitter.com/myvalidator',
    },
  })
  .build()
```

#### Validator Config (Type 3)

Update validator configuration (commission, delegation settings, etc.).

```typescript
const tx = await TransactionBuilder.create(provider)
  .sender('klv1...')
  .addContract({
    contractType: 3,
    blsPublicKey: '0xabcd1234...',
    commission: 8, // Update to 8%
    canDelegate: true,
    rewardAddress: 'klv1rewards...', // Change reward address
  })
  .build()
```

#### Unjail (Type 10)

Unjail a validator that was jailed for downtime or misbehavior.

```typescript
const tx = await TransactionBuilder.create(provider)
  .sender('klv1...')
  .addContract({
    contractType: 10,
    // No additional parameters required
  })
  .build()
```

### Governance

#### Proposal (Type 13)

Create a governance proposal to change network parameters.

```typescript
const tx = await TransactionBuilder.create(provider)
  .sender('klv1...')
  .addContract({
    contractType: 13,
    parameters: {
      1: '1000000', // Parameter ID 1: new value
      5: '500000', // Parameter ID 5: new value
    },
    description: 'Increase minimum stake and update rewards',
    epochsDuration: 10, // Voting period: 10 epochs
  })
  .build()
```

#### Vote (Type 14)

Vote on an active governance proposal.

```typescript
// Vote YES
const tx = await TransactionBuilder.create(provider)
  .sender('klv1...')
  .vote({
    proposalId: 5,
    type: 1, // 1 = Yes
    amount: '1000000', // Optional voting weight
  })
  .build()

// Vote NO
const tx = await TransactionBuilder.create(provider)
  .sender('klv1...')
  .vote({
    proposalId: 5,
    type: 2, // 2 = No
  })
  .build()

// Abstain
const tx = await TransactionBuilder.create(provider)
  .sender('klv1...')
  .vote({
    proposalId: 5,
    type: 0, // 0 = Abstain
  })
  .build()
```

### Marketplace

#### Buy (Type 17)

Purchase items from the marketplace.

```typescript
const tx = await TransactionBuilder.create(provider)
  .sender('klv1...')
  .addContract({
    contractType: 17,
    buyType: 0, // 0 = Direct buy
    id: 'order-id-123',
    amount: '1', // Quantity
    currencyId: 'KLV',
    currencyAmount: '1000000',
  })
  .build()
```

#### Sell (Type 18)

List items for sale on the marketplace.

```typescript
const tx = await TransactionBuilder.create(provider)
  .sender('klv1...')
  .addContract({
    contractType: 18,
    marketType: 0, // 0 = Fixed price
    marketplaceId: 'marketplace-id',
    assetId: 'MYNFT-ABCD/NONCE-1',
    currencyId: 'KLV',
    price: '1000000',
    endTime: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  })
  .build()
```

#### Cancel Market Order (Type 19)

Cancel a marketplace listing.

```typescript
const tx = await TransactionBuilder.create(provider)
  .sender('klv1...')
  .addContract({
    contractType: 19,
    orderId: 'order-id-123',
  })
  .build()
```

#### Create Marketplace (Type 20)

Create a new marketplace.

```typescript
const tx = await TransactionBuilder.create(provider)
  .sender('klv1...')
  .addContract({
    contractType: 20,
    name: 'My NFT Marketplace',
    referralAddress: 'klv1referral...',
    referralPercentage: 2, // 2% referral fee
  })
  .build()
```

### ITO (Initial Token Offering)

#### Config ITO (Type 15)

Configure an Initial Token Offering for your asset.

```typescript
const tx = await TransactionBuilder.create(provider)
  .sender('klv1...')
  .addContract({
    contractType: 15,
    kda: 'MYTOKEN-ABCD',
    receiverAddress: 'klv1receiver...',
    status: 1, // 1 = Active
    maxAmount: '1000000000',
    packInfo: {
      pack1: {
        packs: [{ amount: '1000', price: '100000' }],
      },
      pack2: {
        packs: [{ amount: '10000', price: '900000' }],
      },
    },
    defaultLimitPerAddress: '100000',
    whitelistStatus: 1,
    startTime: Date.now(),
    endTime: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
  })
  .build()
```

### Smart Contract Operations (Type 63)

Interact with deployed smart contracts.

```typescript
// Deploy contract
const tx = await TransactionBuilder.create(provider)
  .sender('klv1...')
  .smartContract({
    address: 'klv1000...', // Zero address for deployment
    scType: 0, // 0 = Deploy
  })
  .data(['contractCode', 'initArgs'])
  .build()

// Invoke contract function
const tx = await TransactionBuilder.create(provider)
  .sender('klv1...')
  .smartContract({
    address: 'klv1contract...',
    scType: 1, // 1 = Invoke
    callValue: {
      KLV: '1000000', // Send 1 KLV with call
    },
  })
  .data(['transfer', 'klv1recipient...', '500000'])
  .build()

// Query contract (read-only)
const tx = await TransactionBuilder.create(provider)
  .sender('klv1...')
  .smartContract({
    address: 'klv1contract...',
    scType: 1,
  })
  .data(['getBalance', 'klv1address...'])
  .build()

// Upgrade contract
const tx = await TransactionBuilder.create(provider)
  .sender('klv1...')
  .smartContract({
    address: 'klv1contract...',
    scType: 2, // 2 = Upgrade
  })
  .data(['newContractCode'])
  .build()
```

### Account Management

#### Set Account Name (Type 12)

Set a human-readable name for your account.

```typescript
const tx = await TransactionBuilder.create(provider)
  .sender('klv1...')
  .addContract({
    contractType: 12,
    name: 'myaccount',
  })
  .build()
```

#### Update Account Permission (Type 22)

Configure multi-signature permissions for your account.

```typescript
const tx = await TransactionBuilder.create(provider)
  .sender('klv1...')
  .addContract({
    contractType: 22,
    permissions: [
      {
        type: 0, // Owner permission
        permissionName: 'owner',
        threshold: '2', // Require 2 signatures
        operations: '*', // All operations
        signers: [
          { address: 'klv1signer1...', weight: '1' },
          { address: 'klv1signer2...', weight: '1' },
          { address: 'klv1signer3...', weight: '1' },
        ],
      },
    ],
  })
  .build()
```

### Deposit (Type 23)

Deposit assets into contracts or protocols.

```typescript
const tx = await TransactionBuilder.create(provider)
  .sender('klv1...')
  .addContract({
    contractType: 23,
    depositType: 0, // Deposit type
    kda: 'MYTOKEN-ABCD',
    amount: '1000000',
  })
  .build()
```

## API Reference

### TransactionBuilder

#### Constructor Methods

- `TransactionBuilder.create(provider?)` - Create new builder with optional provider
- `new TransactionBuilder(provider?)` - Direct instantiation

#### Configuration Methods

- `.sender(address)` - Set transaction sender (required)
- `.nonce(nonce)` - Set nonce manually (for offline building)
- `.setChainId(chainId)` - Set chain ID (overrides provider's network)
- `.kdaFee(fee)` - Pay fees in custom KDA instead of KLV
- `.permissionId(id)` - Set permission ID for multi-sig
- `.data(data)` - Set transaction data (for smart contracts)
- `.callOptions(options)` - Set multiple options at once

#### Contract Methods

- `.transfer(params)` - Add transfer contract
- `.freeze(params)` - Add freeze (stake) contract
- `.unfreeze(params)` - Add unfreeze (unstake) contract
- `.delegate(params)` - Add delegation contract
- `.undelegate(params)` - Add undelegation contract
- `.withdraw(params)` - Add withdrawal contract
- `.claim(params)` - Add claim contract
- `.createAsset(params)` - Add asset creation contract
- `.createValidator(params)` - Add validator creation contract
- `.vote(params)` - Add vote contract
- `.smartContract(params)` - Add smart contract call
- `.addContract(contract)` - Add any contract by type

#### Build Methods

- `.build()` - Build using node (requires provider)
- `.buildProto(options)` - Build offline (no network)
- `.buildRequest()` - Build request object for node endpoint

#### Utility Methods

- `.reset()` - Clear all contracts and state
- `.getProvider()` - Get provider instance
- `.setProvider(provider)` - Set provider instance

### Transaction

#### Instance Methods

- `sign(privateKey)` - Sign transaction with private key
- `toHex()` - Get hex-encoded proto bytes
- `toBytes()` - Get proto bytes as Uint8Array
- `toJSON()` - Convert to JSON object
- `isSigned()` - Check if transaction is signed
- `getTotalFee()` - Get total fee amount
- `getHash()` - Get transaction hash
- `getHashBytes()` - Get transaction hash as bytes

#### Static Methods

- `Transaction.fromHex(hex)` - Create from hex string
- `Transaction.fromBytes(bytes)` - Create from proto bytes
- `Transaction.fromObject(obj)` - Create from JSON object
- `Transaction.fromTransaction(tx)` - Create copy of transaction

## Helper Functions

### Transaction Helpers

```typescript
import {
  createTransfer,
  createFreeze,
  createDelegate,
  // ... and more
} from '@klever/connect-transactions'

// Create transfer request object
const transfer = createTransfer({
  receiver: 'klv1...',
  amount: '1000000',
})

// Use with builder
const tx = await builder.transfer(transfer).build()
```

### Amount Conversion

```typescript
import { toKLVUnits, fromKLVUnits, toUnits, fromUnits } from '@klever/connect-transactions'

// Convert KLV to smallest units
const amount = toKLVUnits('1.5') // '1500000'

// Convert from smallest units
const klv = fromKLVUnits('1500000') // '1.5'

// Custom precision
const amount = toUnits('1.5', 8) // '150000000' (8 decimals)
const readable = fromUnits('150000000', 8) // '1.5'
```

## Advanced Patterns

### Multiple Contracts in One Transaction

The Klever blockchain supports multiple contracts in a single transaction, allowing you to batch operations atomically.

**Benefits:**

- Reduced transaction count and fees
- Atomic execution (all-or-nothing)
- Simplified transaction management
- Better UX for complex operations

```typescript
// Common pattern: Transfer + Freeze + Delegate
const tx = await TransactionBuilder.create(provider)
  .sender('klv1...')
  .transfer({ receiver: 'klv1friend...', amount: '1000000' }) // Send 1 KLV to friend
  .freeze({ amount: '5000000' }) // Freeze 5 KLV for staking
  .delegate({ receiver: 'klv1validator...', bucketId: 'bucket-123' }) // Delegate to validator
  .build()

// Batch transfers (airdrop pattern)
const recipients = [
  { receiver: 'klv1alice...', amount: '1000000' },
  { receiver: 'klv1bob...', amount: '1000000' },
  { receiver: 'klv1charlie...', amount: '1000000' },
]

const builder = TransactionBuilder.create(provider).sender('klv1sender...')

recipients.forEach((recipient) => {
  builder.transfer(recipient)
})

const tx = await builder.build()

// Complex asset management
const tx = await TransactionBuilder.create(provider)
  .sender('klv1...')
  .createAsset({
    type: 0,
    name: 'My Token',
    ticker: 'MTK',
    ownerAddress: 'klv1...',
    precision: 6,
    maxSupply: '1000000000000',
    initialSupply: '100000000000',
  })
  .transfer({ receiver: 'klv1treasury...', amount: '50000000000', kda: 'MTK-ABCD' }) // Send to treasury
  .freeze({ amount: '25000000000', kda: 'MTK-ABCD' }) // Freeze some tokens
  .build()
```

### Custom Fee Configuration

Pay transaction fees in custom KDA tokens instead of KLV.

```typescript
// Pay fees in custom token
const tx = await TransactionBuilder.create(provider)
  .sender('klv1...')
  .kdaFee({ kda: 'MYTOKEN-ABCD', amount: '1000000' })
  .transfer({ receiver: 'klv1...', amount: '1000000' })
  .build()

// Offline building with custom KDA fee
const tx = TransactionBuilder.create()
  .sender('klv1...')
  .nonce(123)
  .kdaFee({ kda: 'MYTOKEN-ABCD', amount: '1000000' })
  .transfer({ receiver: 'klv1...', amount: '1000000' })
  .buildProto({
    chainId: '100',
    fees: { kAppFee: 0, bandwidthFee: 0 }, // Zeros because using KDA fee
  })
```

### Offline Transaction Signing

For maximum security, build and sign transactions on air-gapped computers.

```typescript
// Step 1: On connected computer - Fetch account data
const provider = new KleverProvider({ network: 'mainnet' })
const account = await provider.getAccount('klv1...')
console.log('Nonce:', account.nonce)
console.log('Balance:', account.balance)

// Transfer nonce to air-gapped computer

// Step 2: On air-gapped computer - Build and sign transaction
const tx = TransactionBuilder.create()
  .sender('klv1...')
  .nonce(123) // Use fetched nonce
  .transfer({ receiver: 'klv1recipient...', amount: '1000000' })
  .buildProto({
    chainId: '100',
    fees: { kAppFee: 500000, bandwidthFee: 100000 },
  })

await tx.sign(privateKey)
const signedHex = tx.toHex()
console.log('Signed transaction:', signedHex)

// Transfer signedHex back to connected computer

// Step 3: On connected computer - Broadcast transaction
const hash = await provider.sendRawTransaction(signedHex)
console.log('Transaction hash:', hash)
```

### Transaction Batching

Build multiple transactions with sequential nonces for batch processing.

```typescript
// Fetch current nonce
const account = await provider.getAccount('klv1sender...')
let currentNonce = account.nonce

// Build batch of transactions
const transactions: Transaction[] = []

for (let i = 0; i < 10; i++) {
  const tx = TransactionBuilder.create()
    .sender('klv1sender...')
    .nonce(currentNonce++)
    .transfer({
      receiver: `klv1recipient${i}...`,
      amount: '1000000',
    })
    .buildProto({
      chainId: '100',
      fees: { kAppFee: 500000, bandwidthFee: 100000 },
    })

  await tx.sign(privateKey)
  transactions.push(tx)
}

// Broadcast all transactions
const hashes = await provider.sendRawTransactions(transactions.map((tx) => tx.toHex()))
console.log('Transaction hashes:', hashes)
```

### Nonce Management Strategies

Handle nonces correctly for reliable transaction submission.

```typescript
// Strategy 1: Automatic (recommended for single transactions)
const tx = await TransactionBuilder.create(provider)
  .sender('klv1...')
  .transfer({ receiver: 'klv1...', amount: '1000000' })
  .build() // Provider fetches nonce automatically

// Strategy 2: Manual with cache (for batch transactions)
class NonceManager {
  private nonceCache = new Map<string, number>()

  async getNextNonce(provider: IProvider, address: string): Promise<number> {
    if (!this.nonceCache.has(address)) {
      const account = await provider.getAccount(address)
      this.nonceCache.set(address, account.nonce)
    }
    const nonce = this.nonceCache.get(address)!
    this.nonceCache.set(address, nonce + 1)
    return nonce
  }

  reset(address: string) {
    this.nonceCache.delete(address)
  }
}

const nonceManager = new NonceManager()

// Build multiple transactions
const tx1 = TransactionBuilder.create()
  .sender('klv1...')
  .nonce(await nonceManager.getNextNonce(provider, 'klv1...'))
  .transfer({ receiver: 'klv1a...', amount: '1000000' })
  .buildProto({ chainId: '100', fees: { kAppFee: 500000, bandwidthFee: 100000 } })

const tx2 = TransactionBuilder.create()
  .sender('klv1...')
  .nonce(await nonceManager.getNextNonce(provider, 'klv1...'))
  .transfer({ receiver: 'klv1b...', amount: '2000000' })
  .buildProto({ chainId: '100', fees: { kAppFee: 500000, bandwidthFee: 100000 } })

// Strategy 3: Retry on nonce error
async function sendWithRetry(tx: Transaction, maxRetries = 3): Promise<string> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await provider.sendRawTransaction(tx.toHex())
    } catch (error) {
      if (error.message.includes('nonce')) {
        // Rebuild transaction with fresh nonce
        const account = await provider.getAccount(sender)
        // Rebuild tx with new nonce...
      }
      if (i === maxRetries - 1) throw error
    }
  }
  throw new Error('Max retries exceeded')
}
```

### Reusing Builder Instances

Efficiently reuse builder instances for multiple transactions.

```typescript
const builder = TransactionBuilder.create(provider)
const sender = 'klv1sender...'

// Build first transaction
const tx1 = await builder
  .sender(sender)
  .transfer({ receiver: 'klv1abc...', amount: '1000000' })
  .build()

await tx1.sign(privateKey)
await provider.sendRawTransaction(tx1.toHex())

// Reset and build second transaction
const tx2 = await builder.reset().sender(sender).freeze({ amount: '5000000' }).build()

await tx2.sign(privateKey)
await provider.sendRawTransaction(tx2.toHex())

// Reuse with different sender
const tx3 = await builder
  .reset()
  .sender('klv1other...')
  .transfer({ receiver: 'klv1...', amount: '500000' })
  .build()
```

### Hardware Wallet Integration Pattern

Build transactions for hardware wallet signing.

```typescript
// Build unsigned transaction
const tx = TransactionBuilder.create()
  .sender('klv1...')
  .nonce(account.nonce)
  .transfer({ receiver: 'klv1recipient...', amount: '1000000' })
  .buildProto({
    chainId: '100',
    fees: { kAppFee: 500000, bandwidthFee: 100000 },
  })

// Get transaction hash for hardware wallet
const txHash = tx.getHash()
const txHashBytes = tx.getHashBytes()

// Sign with hardware wallet (pseudocode)
const signature = await hardwareWallet.signTransaction(txHashBytes, derivationPath)

// Add signature to transaction
tx.Signature = [signature]

// Broadcast
const hash = await provider.sendRawTransaction(tx.toHex())
```

### Transaction Inspection and Debugging

Inspect transaction details before signing and broadcasting.

```typescript
// Build transaction
const tx = await TransactionBuilder.create(provider)
  .sender('klv1...')
  .transfer({ receiver: 'klv1...', amount: '1000000' })
  .build()

// Inspect transaction details
console.log('Transaction Hash:', tx.getHash())
console.log('Total Fee:', tx.getTotalFee())
console.log('Is Signed:', tx.isSigned())
console.log('Sender:', tx.RawData?.Sender)
console.log('Nonce:', tx.RawData?.Nonce)
console.log('Contracts:', tx.RawData?.Contract)

// Convert to JSON for logging
const txJson = tx.toJSON()
console.log('Transaction JSON:', JSON.stringify(txJson, null, 2))

// Get proto bytes size
const protoBytes = tx.toBytes()
console.log('Proto size:', protoBytes.length, 'bytes')

// Sign and verify
await tx.sign(privateKey)
console.log('Is Signed:', tx.isSigned())
console.log('Signature:', tx.Signature)
```

## Error Handling

Proper error handling ensures robust transaction processing and better user experience.

### Common Errors

```typescript
import { ValidationError, TransactionError } from '@klever/connect-core'

try {
  const tx = await TransactionBuilder.create(provider)
    .sender('klv1...')
    .transfer({ receiver: 'klv1recipient...', amount: '1000000' })
    .build()

  await tx.sign(privateKey)
  const hash = await provider.sendRawTransaction(tx.toHex())
} catch (error) {
  // Validation errors (caught during building)
  if (error instanceof ValidationError) {
    console.error('Validation failed:', error.message)
    // Examples:
    // - Invalid address format
    // - Negative amounts
    // - Missing required fields
    // - Invalid nonce
    return
  }

  // Transaction errors (caught during signing or broadcasting)
  if (error instanceof TransactionError) {
    console.error('Transaction error:', error.message)
    // Examples:
    // - Signing failed
    // - Insufficient balance
    // - Transaction rejected by network
    return
  }

  // Network errors
  if (error.message.includes('network')) {
    console.error('Network error:', error.message)
    // Retry or notify user
    return
  }

  // Generic error
  console.error('Unexpected error:', error)
}
```

### Validation Before Building

Validate inputs before building transactions to provide better error messages.

```typescript
import { isValidAddress } from '@klever/connect-core'

function validateTransfer(receiver: string, amount: string): string[] {
  const errors: string[] = []

  if (!isValidAddress(receiver)) {
    errors.push(`Invalid receiver address: ${receiver}`)
  }

  const amountNum = Number(amount)
  if (isNaN(amountNum) || amountNum <= 0) {
    errors.push(`Invalid amount: ${amount}`)
  }

  return errors
}

// Use validation
const errors = validateTransfer(receiver, amount)
if (errors.length > 0) {
  console.error('Validation errors:', errors)
  return
}

// Proceed with transaction
const tx = await TransactionBuilder.create(provider)
  .sender('klv1...')
  .transfer({ receiver, amount })
  .build()
```

### Handling Insufficient Balance

Check balance before creating transactions.

```typescript
async function safeTransfer(
  provider: IProvider,
  sender: string,
  receiver: string,
  amount: bigint,
): Promise<string> {
  // Check balance
  const balance = await provider.getBalance(sender)

  // Estimate fees (approximate)
  const estimatedFee = 600000n // ~0.6 KLV

  if (balance < amount + estimatedFee) {
    throw new Error(
      `Insufficient balance. Have: ${balance}, Need: ${amount + estimatedFee} (including fees)`,
    )
  }

  // Build and send transaction
  const tx = await TransactionBuilder.create(provider)
    .sender(sender)
    .transfer({ receiver, amount })
    .build()

  await tx.sign(privateKey)
  return await provider.sendRawTransaction(tx.toHex())
}
```

### Retry Logic

Implement retry logic for transient failures.

```typescript
async function buildWithRetry(
  builder: TransactionBuilder,
  maxRetries = 3,
  delayMs = 1000,
): Promise<Transaction> {
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await builder.build()
    } catch (error) {
      lastError = error as Error
      console.warn(`Build attempt ${attempt} failed:`, error.message)

      if (attempt < maxRetries) {
        // Wait before retrying
        await new Promise((resolve) => setTimeout(resolve, delayMs * attempt))
      }
    }
  }

  throw new Error(`Failed after ${maxRetries} attempts: ${lastError?.message}`)
}

// Usage
const tx = await buildWithRetry(
  TransactionBuilder.create(provider)
    .sender('klv1...')
    .transfer({ receiver: 'klv1...', amount: '1000000' }),
)
```

### Graceful Degradation

Fall back to offline building if node is unavailable.

```typescript
async function buildTransaction(
  provider: IProvider | undefined,
  sender: string,
  receiver: string,
  amount: string,
): Promise<Transaction> {
  if (provider) {
    try {
      // Try node-assisted building
      return await TransactionBuilder.create(provider)
        .sender(sender)
        .transfer({ receiver, amount })
        .build()
    } catch (error) {
      console.warn('Node unavailable, falling back to offline building:', error.message)
    }
  }

  // Fall back to offline building
  // Note: You need to provide nonce and fees
  const nonce = await getNonceFromCache(sender) // Your cache implementation
  return TransactionBuilder.create()
    .sender(sender)
    .nonce(nonce)
    .transfer({ receiver, amount })
    .buildProto({
      chainId: '100',
      fees: { kAppFee: 500000, bandwidthFee: 100000 },
    })
}
```

## Integration Examples

### Complete Wallet Integration

Full example of wallet integration with transaction building.

```typescript
import { KleverProvider } from '@klever/connect-provider'
import { TransactionBuilder, Transaction } from '@klever/connect-transactions'
import { Wallet } from '@klever/connect-wallet'

class WalletService {
  private provider: KleverProvider
  private wallet: Wallet

  constructor(privateKey: string, network: 'mainnet' | 'testnet') {
    this.provider = new KleverProvider({ network })
    this.wallet = new Wallet(privateKey, this.provider)
  }

  async sendKLV(to: string, amount: bigint): Promise<string> {
    // Build transaction
    const tx = await TransactionBuilder.create(this.provider)
      .sender(this.wallet.address)
      .transfer({ receiver: to, amount })
      .build()

    // Sign
    await tx.sign(this.wallet.privateKey)

    // Broadcast
    return await this.provider.sendRawTransaction(tx.toHex())
  }

  async stake(amount: bigint, validatorAddress: string): Promise<string> {
    // Build multi-contract transaction
    const tx = await TransactionBuilder.create(this.provider)
      .sender(this.wallet.address)
      .freeze({ amount })
      .delegate({ receiver: validatorAddress })
      .build()

    await tx.sign(this.wallet.privateKey)
    return await this.provider.sendRawTransaction(tx.toHex())
  }

  async unstake(bucketId: string): Promise<string> {
    const tx = await TransactionBuilder.create(this.provider)
      .sender(this.wallet.address)
      .undelegate({ bucketId })
      .unfreeze({ kda: 'KLV', bucketId })
      .build()

    await tx.sign(this.wallet.privateKey)
    return await this.provider.sendRawTransaction(tx.toHex())
  }

  async getBalance(): Promise<bigint> {
    return await this.provider.getBalance(this.wallet.address)
  }
}

// Usage
const walletService = new WalletService(privateKey, 'mainnet')

// Send KLV
const hash = await walletService.sendKLV('klv1recipient...', 1000000n)
console.log('Transaction hash:', hash)

// Stake and delegate
const stakeHash = await walletService.stake(5000000n, 'klv1validator...')
console.log('Stake transaction:', stakeHash)
```

### React Hook Integration

```typescript
import { useCallback, useState } from 'react'
import { TransactionBuilder } from '@klever/connect-transactions'
import { useKleverProvider, useWallet } from '@klever/connect-react'

export function useSendTransaction() {
  const provider = useKleverProvider()
  const { address, sign } = useWallet()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const sendTransaction = useCallback(
    async (receiver: string, amount: string) => {
      if (!provider || !address) {
        throw new Error('Wallet not connected')
      }

      setLoading(true)
      setError(null)

      try {
        // Build transaction
        const tx = await TransactionBuilder.create(provider)
          .sender(address)
          .transfer({ receiver, amount })
          .build()

        // Sign with connected wallet
        const signedTx = await sign(tx)

        // Broadcast
        const hash = await provider.sendRawTransaction(signedTx.toHex())

        return hash
      } catch (err) {
        setError(err as Error)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [provider, address, sign],
  )

  return { sendTransaction, loading, error }
}

// Component usage
function SendButton() {
  const { sendTransaction, loading } = useSendTransaction()

  const handleSend = async () => {
    const hash = await sendTransaction('klv1recipient...', '1000000')
    console.log('Sent:', hash)
  }

  return (
    <button onClick={handleSend} disabled={loading}>
      {loading ? 'Sending...' : 'Send 1 KLV'}
    </button>
  )
}
```

### Transaction Monitoring

Monitor transaction status after broadcasting.

```typescript
async function sendAndMonitor(
  provider: IProvider,
  tx: Transaction,
  onProgress?: (status: string) => void,
): Promise<void> {
  // Broadcast transaction
  const hash = await provider.sendRawTransaction(tx.toHex())
  console.log('Transaction broadcasted:', hash)

  onProgress?.('pending')

  // Wait for confirmation
  const result = await provider.waitForTransaction(
    hash,
    1, // confirmations
    (status, data) => {
      console.log('Status:', status, 'Data:', data)
      onProgress?.(status)
    },
  )

  if (!result) {
    throw new Error('Transaction failed or timed out')
  }

  console.log('Transaction confirmed!')
  onProgress?.('confirmed')
}

// Usage
const tx = await TransactionBuilder.create(provider)
  .sender('klv1...')
  .transfer({ receiver: 'klv1...', amount: '1000000' })
  .build()

await tx.sign(privateKey)

await sendAndMonitor(tx, provider, (status) => {
  console.log('Current status:', status)
})
```

### Batch Transaction Processor

Process multiple transactions efficiently.

```typescript
class BatchTransactionProcessor {
  constructor(
    private provider: IProvider,
    private privateKey: PrivateKey,
  ) {}

  async processBatch(operations: Array<{ receiver: string; amount: string }>): Promise<string[]> {
    // Get current nonce
    const sender = await this.getSenderAddress()
    const account = await this.provider.getAccount(sender)
    let nonce = account.nonce

    // Build all transactions
    const transactions: Transaction[] = []

    for (const op of operations) {
      const tx = TransactionBuilder.create()
        .sender(sender)
        .nonce(nonce++)
        .transfer({ receiver: op.receiver, amount: op.amount })
        .buildProto({
          chainId: this.provider.getNetwork().chainId,
          fees: { kAppFee: 500000, bandwidthFee: 100000 },
        })

      await tx.sign(this.privateKey)
      transactions.push(tx)
    }

    // Broadcast all at once
    return await this.provider.sendRawTransactions(transactions.map((tx) => tx.toHex()))
  }

  private async getSenderAddress(): Promise<string> {
    // Derive address from private key
    // Implementation depends on your crypto provider
    return 'klv1...'
  }
}

// Usage
const processor = new BatchTransactionProcessor(provider, privateKey)

const operations = [
  { receiver: 'klv1alice...', amount: '1000000' },
  { receiver: 'klv1bob...', amount: '2000000' },
  { receiver: 'klv1charlie...', amount: '3000000' },
]

const hashes = await processor.processBatch(operations)
console.log('Batch processed:', hashes)
```

## Performance

Benchmarked on Apple M1 Pro, Node.js v20:

- **Transaction building** (buildProto): ~0.003ms (335,000 ops/sec)
- **Proto encoding** (toBytes): ~0.0002ms (4.1M ops/sec)
- **Signature generation** (sign): ~0.5ms (2,000 ops/sec)
- **Node-assisted building** (build): ~100-300ms (depends on network latency)

**Memory Usage:**

- Single transaction: ~2KB
- Batch of 100 transactions: ~200KB
- Proto bytes per transaction: ~200-500 bytes (varies by complexity)

## TypeScript Support

Full TypeScript support with type definitions included:

```typescript
import type { TransferRequest, FreezeRequest, BuildCallOptions } from '@klever/connect-transactions'
```

## License

MIT
