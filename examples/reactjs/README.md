# `reactjs/` — Vite + React 19 dApp examples

Front-end examples that demonstrate every public hook and component exported by
[`@klever/connect-react`](../../packages/connect-react/) — plus a few full-app
patterns (form validation, toasts, multi-tx monitor).

> Phase 1 ships this README and conventions only. The per-example folders below
> arrive in phases 7-9.

## Conventions

- Stack: **Vite + React 19** (TypeScript template). No Next.js, no CRA.
- Each `reactjs/<flow>/` is a self-contained Vite app with its own
  `package.json`, `vite.config.ts`, `index.html`, and dev server.
- All SDK imports use the umbrella: `@klever/connect`.
- Production code uses `BrowserWallet` (Klever Web Extension). **Tests** swap in
  the in-repo [`MockWallet`](../_shared/mock-wallet/) so vitest runs without an
  extension.
- Tests: `vitest` + `@testing-library/react` for component tests, mocked
  provider/wallet by default. `*.testnet.test.ts` exercises real testnet
  (excluded from CI).
- Private keys are **never** entered into React examples. Signing always goes
  through the extension in production code.

## Categories of flows shipped here

- **Provider & connection.** `KleverProvider` setup, connect/disconnect UX,
  network switch, account-changed listener.
- **Read flows.** Live balance display (`useBalance`), read-only smart-contract
  query.
- **Send flows.** Transfer KLV, transfer KDA, transfer NFT with royalties.
- **Staking flows.** End-to-end staking split into discrete stages (freeze ->
  delegate -> claim -> unfreeze -> withdraw), respecting cooldowns.
- **Governance.** Vote on a proposal.
- **Marketplace.** List asset, buy listing.
- **ITO.** Buy from an ITO.
- **Smart contracts.** Read-only query from a component, mutable invoke via
  extension, payable invoke.
- **Tx monitoring.** Multi-tx live status (`useTransactionMonitor`).
- **UX patterns.** Error handling and toasts, real-time form validation with
  core helpers.

## Running

```bash
cd examples/reactjs/<flow>
npm install
npm run dev          # Vite dev server
npm test             # vitest run (mocked, uses MockWallet)
npm run test:testnet # live testnet (manual; needs extension)
```

## React-specific testing

React component tests use the in-repo `MockWallet`:

```ts
import { MockWallet } from '../../_shared/mock-wallet'
```

The mock implements the same surface as `BrowserWallet` (connect, disconnect,
signTransaction, signMessage, getAddress, broadcastTransaction, event
emitters) without any extension dependency. See its README for usage.

## React 19 only

React 18 is intentionally **not** supported in `peerDependencies`.
