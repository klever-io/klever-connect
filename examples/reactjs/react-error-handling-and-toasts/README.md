# `react-error-handling-and-toasts`

> Pattern: classify SDK `KleverError` subclasses and surface them as toast notifications.

## What it shows

A reusable `useToasts()` hook plus a `classify(err)` helper that maps each error type to a severity + UI message. Six demo buttons fire each subclass so AI / readers can see the resulting toast variants side-by-side.

## The classifier

```ts
function classify(err: unknown): ToastShape {
  if (err instanceof ValidationError)  return { severity: 'warn',  ... }
  if (err instanceof NetworkError)     return { severity: 'error', cta: 'Retry', ... }
  if (err instanceof WalletError)      return { severity: 'warn',  cta: 'Check the extension' }
  if (err instanceof TransactionError) return { severity: 'error' }
  if (err instanceof ContractError)    return { severity: 'error' }
  if (err instanceof KleverError)      return { severity: 'error' }
  if (err instanceof Error)            return { severity: 'error', title: 'Unknown error' }
  ...
}
```

Order matters — most-specific first, since all the SDK errors extend `KleverError`.

## Run

```bash
npm install
npm run dev
npm test
npm run test:testnet
```

## Gotchas

- **`instanceof` works because `KleverError` is exported from `@klever/connect`.** Cross-package boundaries can break `instanceof` if you have multiple bundled copies — keep your dependency tree singleton.
- **Don't surface every error to the user.** `EncodingError`, `CryptoError`, and TypeScript narrowing failures are developer bugs; log them to Sentry and show a generic "Something went wrong" toast.
- **Auto-dismiss success toasts** but leave error toasts sticky — users need time to read them.
