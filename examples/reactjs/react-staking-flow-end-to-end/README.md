# `react-staking-flow-end-to-end`

> Tutorial-style walkthrough of the Klever staking lifecycle. Links the six stage examples in this library.

## Why a tutorial-only example?

Klever staking has an on-chain cooldown between `unfreeze` and `withdraw`. On testnet that's typically multiple epochs — far longer than any single test or `npm run dev` session can wait. So the lifecycle has to be split:

1. `examples/reactjs/freeze-for-staking` — `useFreeze` / `useStaking.freeze`
2. `examples/reactjs/delegate-to-validator` — `useStaking.delegate`
3. `examples/reactjs/claim-staking-rewards` — `useClaim` (APR + FPR)
4. `examples/reactjs/unfreeze` — `useUnfreeze` / `useStaking.unfreeze`
5. **(wait for cooldown — this is on-chain, not in JS)**
6. `examples/reactjs/withdraw-after-cooldown` — `useStaking.withdraw`

Use this folder as the **roadmap**. The page persists your "logical stage" to `localStorage` so you can come back tomorrow after the cooldown expires and pick up where you left off.

## Run

```bash
npm install
npm run dev
npm test
npm run test:testnet
```

## Gotchas

- **`useStaking` is the all-in-one hook** — `freeze`, `unfreeze`, `delegate`, `undelegate`, `claim`, `withdraw` all live on it. The individual stage examples use the dedicated hooks (`useFreeze`, etc.) for clarity, but composing one `useStaking()` per page is fine.
- **`bucketId` lives in the freeze receipt.** Use `parseReceipt` (see `tx-receipt-parse` example) or the typed `FreezeReceiptData` to extract it. Save it locally — you'll need it for `delegate` and `unfreeze`.
- **Cooldown duration depends on chain config.** Testnet is shorter than mainnet but still typically hours to days.
- **Rewards mode:** APR (claimType 0) — global; FPR (claimType 3) — per-frozen-bucket. Some validators participate only in one mode.
