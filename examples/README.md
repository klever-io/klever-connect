# Klever Connect SDK — Examples

A comprehensive, training-grade library of runnable examples for every flow exposed by
[`@klever/connect`](../packages/connect/). Each example is **self-contained** (own
`package.json`, own deps), **deeply commented**, ships with **vitest tests** (mocked +
testnet variants), and an **`EXPECTED_OUTPUT.md`** showing what `npm start` produces.

## Structure

```text
examples/
├── common/        # isomorphic flows (no DOM, no Node-only APIs)
├── nodejs/        # server-side / CLI flows (fs, process, EventEmitter, Express)
├── reactjs/       # Vite + React 19 dApps (browser DOM, hooks, extension)
├── _fixtures/     # shared fixtures consumed by examples
│   └── counter/   # tiny Rust SC fixture (klever-sc) used by sc-* flows
├── _shared/       # shared test helpers (NOT shipped to npm)
│   └── mock-wallet/ # MockWallet implementation used by reactjs/* tests
└── _legacy/       # the previous `/examples` content, preserved for diff audit
                  # (most flows are migrated-with-rewrite into the new layout)
```

## Categories

| Folder                   | Audience                         | Runtime          | Imports                    |
| ------------------------ | -------------------------------- | ---------------- | -------------------------- |
| [`common/`](./common/)   | All — works in Node, browser, RN | Pure TypeScript  | `@klever/connect` umbrella |
| [`nodejs/`](./nodejs/)   | Backend services, CLIs, indexers | Node 20+ via tsx | `@klever/connect` umbrella |
| [`reactjs/`](./reactjs/) | dApp frontends                   | Vite + React 19  | `@klever/connect` umbrella |

`common/` examples are pure-SDK and isomorphic. `nodejs/` examples may use Node-only
APIs (`fs`, `process`, `node:events`, Express). `reactjs/` examples use the browser
DOM, the Klever Web Extension, and React hooks.

## Quick start

Pick any example folder, then:

```bash
cd examples/<category>/<flow>
npm install
cp .env.example .env   # edit values
npm start
```

Run the example's tests:

```bash
npm test            # mocked-provider tests (CI-safe)
npm run test:testnet  # live testnet checks (NOT run in CI)
```

## Common flows (isomorphic)

> Phase 1 scaffolds the three category folders and shared helpers only. The
> per-flow folders below land in phase 2.

- `provider-network-setup` — Build a `KleverProvider` for any network
- `address-validation` — Validate user input (`isKleverAddress`, bech32)
- `format-parse-klv` — bigint <-> human-readable for KLV (6 decimals)
- `format-parse-kda` — Same for arbitrary KDA tokens
- `encoding-utilities` — Hex, base58, base64, bech32, BLAKE2b
- `key-pair-generate-and-import` — Ed25519 key generation and import
- `hd-wallet-from-mnemonic` — BIP39 mnemonic -> derived accounts
- `sign-and-verify-message` — Sign arbitrary text and verify with public key
- `balance-read` — Read KLV + KDA balance for any address
- `account-info` — Fetch full account: nonce, assets, frozen amounts
- `tx-fetch-by-hash` — Look up a tx by hash, render fields
- `block-fetch` — Fetch a block by number / `'latest'`
- `tx-build-modes` — Three build modes: `build`, `buildProto`, `buildRequest`
- `tx-serialize-deserialize` — `Transaction.toHex()` / `Transaction.fromHex()`
- `bucket-list-and-status` — Inspect frozen / delegated buckets (read-only)
- `tx-receipt-parse` — Decode receipts (Freeze -> bucketId, etc.)
- `sc-query-readonly` — Read-only smart-contract endpoint
- `sc-events-parse` — Parse `ContractEvent`s from a tx receipt's logs
- `sc-abi-load-and-validate` — Load ABI JSON, validate, list endpoints

## Node.js flows

See [`nodejs/README.md`](./nodejs/README.md). Includes admin flows
(governance, marketplace, ITO, validator), batch / CSV broadcasting, an Express
REST API, a CLI tool, and a tx polling harness.

## React flows

See [`reactjs/README.md`](./reactjs/README.md). Vite + React 19, demonstrates
`KleverProvider`, all wallet hooks, smart-contract interaction, and a full
staking flow split into discrete cooldown-respecting stages.

## Conventions

- **Imports.** Examples always import from `@klever/connect` (umbrella). Sub-package
  imports (`@klever/connect-core`, etc.) are intentionally avoided so users can copy /
  paste a single dependency.
- **Tests.** `vitest` is the runner. Default tests mock the SDK provider so CI is
  network-free. A separate `*.testnet.test.ts` exercises the live testnet — excluded
  from CI per repo policy.
- **Env vars.** Each example ships `.env.example` listing only the variables that
  example uses. Never commit a real `.env`.
- **Networks.** Default network is **testnet** in every example. Switch via env.
- **Private keys.** Never hard-coded. Always read from env (Node) or from the Klever
  Web Extension (React). Tests use the in-repo `MockWallet` (see `_shared/mock-wallet/`).

## Smart-contract fixture

The `examples/_fixtures/counter/` folder ships a minimal `klever-sc` Rust contract
(increment / add / get) used by the `sc-*` examples. Source is provided; compiled
artifacts (`counter.wasm` + `counter.abi.json`) are produced by running
`./scripts/build.sh` from inside the fixture folder. See its README.

## Legacy

The previous `/examples` content lives untouched under [`_legacy/`](./_legacy/) so
the diff is auditable. Most prior examples are migrated-with-rewrite into the
new layout (heavy comments, tests, expected output); a small number of pure
duplicates / kitchen-sink files were dropped.

## Networks reference

| Network   | Endpoint                        | Faucet                                |
| --------- | ------------------------------- | ------------------------------------- |
| `mainnet` | https://node.mainnet.klever.org | n/a (real funds)                      |
| `testnet` | https://node.testnet.klever.org | https://faucet.testnet.klever.finance |
| `devnet`  | https://node.devnet.klever.org  | https://faucet.devnet.klever.finance  |
| `local`   | http://localhost:8080           | n/a                                   |

## Contributing a new example

1. Pick a flow not already in the library.
2. Choose a category (`common/`, `nodejs/`, `reactjs/`).
3. Scaffold a folder mirroring the structure of an existing one in that category.
4. Add `package.json`, `tsconfig.json`, `.env.example`, `src/index.ts`,
   `src/<flow>.test.ts`, `src/<flow>.testnet.test.ts`, `EXPECTED_OUTPUT.md`,
   `README.md`.
5. Tests must pass under `npm test` without network access.
