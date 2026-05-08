# `react-form-validation-helpers`

> Live form validation in React using `@klever/connect`'s `isValidAddress` and `parseKLV`.

## What this example shows

A controlled "send KLV" form that re-validates on every keystroke. No wallet, no network — just the SDK's built-in helpers wired into React state.

The example is deliberately minimal so the SDK surface dominates the file. In a real dApp you'd compose this same pattern with `useTransaction.sendKLV`, but the validation rules — bech32 address, positive bigint amount — apply identically.

## Why these helpers

| Helper | What it does | Why a regex isn't enough |
|---|---|---|
| `isValidAddress(addr)` | Bech32-decodes and verifies the `klv` HRP. | Bech32 has a checksum: a single typo in the middle is detectable. A regex would silently accept it. |
| `parseKLV(value)` | Converts a human string (`"1.23"`) to a 6-decimal `bigint` (`1230000n`). Throws on bad input. | Floats lose precision — `1.1 + 0.2 !== 1.3` in JS. Always parse to `bigint` before submitting on-chain. |

Both helpers live in `@klever/connect-core` and re-export from the umbrella `@klever/connect`.

## Prerequisites

- Node 20+
- npm (or any package manager)
- No wallet, no env vars needed for this example.

## How to run

```bash
npm install
npm run dev          # http://localhost:5173
npm test             # mocked vitest run (CI-safe)
npm run test:testnet # live variant (still local for this example — no network)
```

## Code map

```
src/
  main.tsx            -- Vite entry, no provider needed
  App.tsx             -- Page shell + reference docs
  TransferForm.tsx    -- The actual SDK call site (isValidAddress + parseKLV)
  __tests__/
    setup.ts                                                -- jest-dom matchers
    react-form-validation-helpers.test.tsx                  -- mocked default
    react-form-validation-helpers.testnet.test.tsx          -- live variant (no-op here)
```

## Gotchas

- **Bech32 checksums fail by one character.** If a user pastes a legacy address that's been truncated, `isValidAddress` will reject it. That's the point — better to fail loudly in the UI than to silently broadcast to a wrong address.
- **`parseKLV` throws.** Wrap it in `try/catch` (we use `tryParseKLV` here) so a render doesn't crash mid-keystroke.
- **`bigint` is not JSON-serializable.** When you log or persist the parsed value, call `.toString()` first.
- **Amount precision is fixed at 6 decimals for KLV.** Other KDA tokens have different precisions — use `parseUnits(value, decimals)` for those (see the `react-send-kda-transfer` example).

## See also

- `react-send-klv-transfer` — same form pattern, but actually broadcasts.
- `react-error-handling-and-toasts` — surfacing `ValidationError` via toasts.
