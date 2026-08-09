# `common/` — Isomorphic SDK examples

Pure-SDK examples that run identically in **Node.js**, the **browser**, and **React
Native**. They never touch:

- The DOM (`window`, `document`, browser-only APIs).
- Node-only APIs (`fs`, `process.stdin`, `node:events`, etc.).

If a flow needs `fs` or the Klever Web Extension, it lives under
[`../nodejs/`](../nodejs/) or [`../reactjs/`](../reactjs/) instead.

## What's here

> Phase 1 scaffolds this folder and the shared conventions only. The
> per-flow subfolders below land in phase 2.

- `provider-network-setup` — 1 — provider for testnet/mainnet/devnet/custom
- `address-validation` — 2 — validate user-input addresses
- `format-parse-klv` — 3 — KLV unit conversion (6 decimals)
- `format-parse-kda` — 4 — arbitrary-precision KDA conversion
- `encoding-utilities` — 5 — hex / base58 / base64 / bech32 / blake2b
- `key-pair-generate-and-import` — 6 — Ed25519 generate, import, derive pubkey
- `hd-wallet-from-mnemonic` — 7 — BIP39 mnemonic, multi-account derivation
- `sign-and-verify-message` — 8 — sign + verify with tamper test
- `balance-read` — 11 — KLV / KDA balance read
- `account-info` — 12 — full account info (nonce, assets)
- `tx-fetch-by-hash` — 13 — look up a transaction by hash
- `block-fetch` — 14 — fetch a block, walk its txs
- `tx-build-modes` — 15 — three transaction-build modes
- `tx-serialize-deserialize` — 16 — `Transaction.toHex` / `fromHex`
- `bucket-list-and-status` — 26 — read frozen / delegated buckets
- `tx-receipt-parse` — 56 — decode tagged receipts
- `sc-query-readonly` — 57 — read-only smart-contract call
- `sc-events-parse` — 61 — parse contract events from logs
- `sc-abi-load-and-validate` — 62 — load + validate ABI JSON

## Conventions

- Every example uses the **umbrella** import: `@klever/connect`. No sub-package imports.
- Tests come in two flavours:
  - `<flow>.test.ts` — uses `vi.mock('@klever/connect', ...)` to stub the provider so
    the suite is hermetic. **This is what CI runs.**
  - `<flow>.testnet.test.ts` — talks to the real testnet RPC. Excluded from CI per
    repo policy. Run with `npm run test:testnet`.
- TypeScript is strict + ESM. `tsconfig.json` does **not** include the `dom` lib so
  accidental browser-API usage is a compile error.
- Each example owns its `package.json` and dependencies (no workspace inheritance).

## Running an example

```bash
cd examples/common/<flow>
npm install
cp .env.example .env  # edit if the example needs values
npm start             # tsx src/index.ts
npm test              # vitest run (mocked)
npm run test:testnet  # vitest run, *.testnet.test.ts only
```

## Why isomorphic matters

These flows are the building blocks every dApp needs. By keeping them DOM-free and
Node-API-free, the same code runs in:

- A Node.js CLI.
- A React component.
- A React Native app.
- A Cloudflare Worker / Vercel Edge function.

When you copy-paste from `common/`, you can drop the snippet into any runtime
without modification.
