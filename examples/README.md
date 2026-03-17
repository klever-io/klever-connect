# Klever Connect SDK — Examples

Runnable TypeScript examples for every major feature of the Klever Connect SDK.

## Prerequisites

```bash
# From the repo root
pnpm install
pnpm build
```

Run any example with:

```bash
npx tsx examples/<category>/<file>.ts
```

## Categories

| Folder                             | Description                                                      | Env vars needed                   |
| ---------------------------------- | ---------------------------------------------------------------- | --------------------------------- |
| [`basic/`](./basic/)               | Balance, account info, simple KLV transfer                       | `PRIVATE_KEY` (for transfer)      |
| [`encoding/`](./encoding/)         | Hex, base58, base64, bech32, BLAKE2b, tx serialization           | `PRIVATE_KEY` (optional)          |
| [`wallet/`](./wallet/)             | Create wallet, HD mnemonic, keystore encryption, message signing | `PRIVATE_KEY`                     |
| [`transactions/`](./transactions/) | Build modes, all contract types, fee control                     | `PRIVATE_KEY`                     |
| [`assets/`](./assets/)             | Create KDA token, mint, burn, manage roles                       | `PRIVATE_KEY`, `ASSET_ID`         |
| [`contracts/`](./contracts/)       | Deploy, call, and invoke smart contracts                         | `PRIVATE_KEY`, `CONTRACT_ADDRESS` |
| [`react/`](./react/)               | KleverProvider, useKlever, useBalance, useTransaction            | (browser only)                    |

## Quick start

```bash
# 1. Check an address balance (no wallet needed)
npx tsx examples/basic/balance.ts

# 2. Generate a new wallet from mnemonic
npx tsx examples/wallet/mnemonic.ts

# 3. Send 1 KLV on testnet — using a .env file (recommended)
cp examples/.env.example examples/.env
# Edit examples/.env and set PRIVATE_KEY=<your_64_char_hex_key>
npx tsx examples/basic/transfer.ts
```

## Environment variables

Examples automatically load `examples/.env` via `dotenv`.
Copy `.env.example` to get started — **never commit the real `.env`**.

```bash
cp examples/.env.example examples/.env
```

| Variable            | Used by                      | Description                       |
| ------------------- | ---------------------------- | --------------------------------- |
| `PRIVATE_KEY`       | Most examples                | 64-char hex private key           |
| `ASSET_ID`          | assets/asset-trigger.ts      | KDA asset ID (e.g. `MTT-ABCD-1A`) |
| `CONTRACT_ADDRESS`  | contracts/\*.ts              | Deployed smart contract address   |
| `WASM_PATH`         | contracts/deploy-contract.ts | Path to compiled `.wasm` file     |
| `ABI_PATH`          | contracts/deploy-contract.ts | Path to `.abi.json` file          |
| `TX_HASH`           | basic/account-info.ts        | Transaction hash to look up       |
| `KDA_ID`            | basic/balance.ts             | KDA token ID for balance check    |
| `KEYSTORE_PASSWORD` | wallet/keystore.ts           | Password for keystore encryption  |

## Networks

All examples default to **testnet**. Switch to mainnet by changing:

```typescript
const provider = new KleverProvider({ network: 'mainnet' })
```

Testnet faucet: https://faucet.testnet.klever.finance

## SDK packages

| Package                     | Imported from                  |
| --------------------------- | ------------------------------ |
| Provider + types            | `@klever/connect-provider`     |
| Wallet                      | `@klever/connect-wallet`       |
| Transaction builder         | `@klever/connect-transactions` |
| Encoding utilities          | `@klever/connect-encoding`     |
| Crypto (keys, HD, signing)  | `@klever/connect-crypto`       |
| Core (types, errors, utils) | `@klever/connect-core`         |
| Smart contracts             | `@klever/connect-contracts`    |
| React hooks                 | `@klever/connect-react`        |
| All-in-one                  | `@klever/connect`              |
