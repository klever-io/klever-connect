# `nodejs/` — Server-side Klever examples

Node.js examples covering CLIs, REST APIs, batch jobs, monitoring services, KDA
admin flows, smart-contract deployment, governance, marketplace and ITO admin —
plus the Node side of every signing flow that also has a React variant.

> This README is a **placeholder**. The per-example folders and the full table
> are populated by the dedicated `nodejs/` agent in this multi-agent build.
> See `FLOW-INVENTORY.md §4` for the master list.

## Conventions

- Each `nodejs/<flow>/` is a self-contained package: own `package.json`, own
  dependencies, own `tsconfig.json`, runnable with `npm start`.
- All examples import from the umbrella: `@klever/connect`.
- Runtime: Node 20+ via `tsx` (no compile step).
- Tests: `vitest` with mocked provider by default; `*.testnet.test.ts` for live
  testnet (excluded from CI).
- Private keys come from environment variables, never hard-coded. `.env.example`
  documents the variables each flow uses.

## Categories of flows shipped here

- **Wallet management.** Keystore round-trip, key import, generation.
- **Hello-world transactions.** KLV transfer, KDA transfer, NFT transfer with royalties.
- **Staking lifecycle.** Freeze, unfreeze, delegate, undelegate, claim, withdraw —
  each as a discrete stage (cooldowns are documented, not waited on).
- **KDA admin.** Create fungible token, create NFT collection, mint, burn, role
  management, logo / URI updates, royalties, pause / resume.
- **Validator admin.** Create validator, update config, unjail.
- **Governance.** Create proposal, vote.
- **Marketplace.** Create marketplace, list asset, buy listing, cancel order.
- **ITO.** Configure, set prices, buy.
- **Account ops.** Set name, update permissions, deposit.
- **Batch.** Bulk transfer, CSV-driven bulk transfer with dry-run.
- **Monitoring & polling.** Block monitor, balance alert watcher, tx poll-until-confirmed.
- **Subscriptions.** Provider event subscribe (`block`, `pending`).
- **Smart contracts.** Invoke (mutable), invoke-payable, deploy, full deploy +
  interact end-to-end (uses the `_fixtures/counter/` Rust contract).
- **Apps.** CLI wallet, Express REST API.

## Running

```bash
cd examples/nodejs/<flow>
npm install
cp .env.example .env  # set PRIVATE_KEY etc.
npm start             # runs the example
npm test              # mocked tests (CI)
npm run test:testnet  # live testnet (manual)
```

## Smart-contract examples

The `sc-deploy`, `sc-invoke-mutable`, `sc-invoke-payable-with-klv`, and
`sc-deploy-and-interact-end-to-end` flows consume the in-repo
[`_fixtures/counter/`](../_fixtures/counter/) contract. Build it once with
`./scripts/build.sh` from the fixture folder; the flows then read
`output/counter.wasm` and `output/counter.abi.json`.
