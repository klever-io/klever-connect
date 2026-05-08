# Basic Examples

Foundational patterns for connecting to the Klever blockchain — reading data, checking balances, and sending your first transaction.

## Examples

### `balance.ts` — Check KLV / KDA balance

No wallet required. Pass any address as an argument.

```bash
npx tsx balance.ts klv1your_address_here

# Also check a KDA token balance
KDA_ID=MY-TOKEN-ABCD npx tsx balance.ts klv1your_address_here
```

### `account-info.ts` — Full account details

Fetches nonce, all token balances, and handles non-existent accounts gracefully.

```bash
npx tsx account-info.ts klv1your_address_here
```

### `transfer.ts` — Send KLV

Builds, signs, and broadcasts a transfer transaction.

```bash
# Send to a specific address
npx tsx transfer.ts klv1receiver_address_here

# Or set receiver via env var
RECEIVER=klv1receiver_address_here npx tsx transfer.ts

# No address provided → sends to self
npx tsx transfer.ts
```

Requires `PRIVATE_KEY` in your `.env`.

## Key Concepts

**Provider** — read-only connection to the blockchain:

```typescript
const provider = new KleverProvider({ network: 'testnet' }) // or 'mainnet'
```

**Wallet** — signs and broadcasts transactions:

```typescript
const wallet = new NodeWallet(provider, privateKey)
await wallet.connect()
```

**Amounts** — KLV uses 6 decimal places:

```typescript
parseKLV('10') // → 10_000_000n (bigint)
formatKLV(10_000_000n) // → '10'
```

## Networks

| Network   | Use case                |
| --------- | ----------------------- |
| `testnet` | Development and testing |
| `mainnet` | Production              |
