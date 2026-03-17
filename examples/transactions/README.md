# Transaction Examples

Building, signing, and broadcasting Klever blockchain transactions.

## Examples

### `build-and-sign.ts` — Three build modes

Node-assisted, offline (buildProto), and buildRequest — explained with a simple transfer.

```bash
PRIVATE_KEY=your_hex_key npx tsx build-and-sign.ts
```

### `all-types.ts` — All contract types

Transfer, Freeze, Delegate, Undelegate, Unfreeze, Claim, and more using `contractType`.

```bash
PRIVATE_KEY=your_hex_key BUCKET_ID=your_bucket npx tsx all-types.ts
```

### `fee-estimation.ts` — Fee control

Build offline transactions with explicit fees; optionally pay fees in a KDA token.

```bash
PRIVATE_KEY=your_hex_key npx tsx fee-estimation.ts
```

## Key Concepts

### Build modes

| Method              | Network required? | Use case                     |
| ------------------- | ----------------- | ---------------------------- |
| `.build()`          | Yes               | Standard online usage        |
| `.buildProto(opts)` | No                | Air-gapped / offline signing |
| `.buildRequest()`   | No                | Custom API integration       |

### ContractRequestData structure

Every transaction payload is a `ContractRequestData` discriminated union:

```typescript
// contractType identifies the operation
await wallet.sendTransaction({ contractType: 0, receiver: '...', amount: 1_000_000n })
//                             ────────────┘
//                             0=Transfer, 4=Freeze, 6=Delegate, 9=Claim …
```

### contractType reference

| contractType | Operation     |
| ------------ | ------------- |
| 0            | Transfer      |
| 1            | CreateAsset   |
| 4            | Freeze        |
| 5            | Unfreeze      |
| 6            | Delegate      |
| 7            | Undelegate    |
| 8            | Withdraw      |
| 9            | Claim         |
| 14           | Vote          |
| 63           | SmartContract |

### Amounts

All amounts are in the token's **smallest unit** (KLV = 6 decimals):

```typescript
parseKLV('10') // 10_000_000n — 10 KLV
parseKLV('0.5') // 500_000n    — 0.5 KLV
```
