# `_shared/mock-wallet`

Test-only wallet + provider stubs used by every `common/*` and `reactjs/*`
example test in this library. Lives inside the monorepo (NOT published to npm)
so each example can import it via a relative path:

```ts
import { MockWallet, createMockProvider } from '../../../_shared/mock-wallet'
```

## What it provides

### `MockWallet`

A deterministic implementation of the public surface of `BrowserWallet` from
`@klever/connect-wallet` — no network, no extension, no real crypto. Mirrors
every method called by the `reactjs/*` hooks and the `common/*` SDK examples:

| Method                                 | Behaviour                                                                            |
| -------------------------------------- | ------------------------------------------------------------------------------------ |
| `connect()` / `disconnect()`           | Toggle internal flag, emit corresponding event.                                      |
| `isConnected()`                        | Returns the internal flag.                                                           |
| `signMessage(...)`                     | Returns a stub `Signature` of 64 zero bytes.                                         |
| `signTransaction(tx)`                  | Returns the same Transaction (no real signature).                                    |
| `transfer(req)` / `sendTransaction(c)` | Records the contract in `wallet.txLog`, returns a fake `TransactionSubmitResult`.    |
| `broadcastTransaction(tx)`             | Returns `mock-broadcast-<incrementing nonce>`.                                       |
| `broadcastTransactions(txs)`           | Returns one mock hash per input.                                                     |
| `getBalance(asset?)` / `getNonce()`    | Return the values you constructed the wallet with.                                   |
| `on / off / removeAllListeners`        | Standard EventEmitter-style interface for `connect`, `disconnect`, `accountChanged`. |

Constructor options:

```ts
new MockWallet({
  address?: string,                                 // default: deterministic test address
  publicKey?: string,                               // default: 32 zero bytes (hex)
  balance?: bigint,                                 // default: 1 000 000 000n (1000 KLV)
  nonce?: number,                                   // default: 0
  txLog?: ContractRequestData[],                    // shared log if you want to seed it
  onSendTransaction?: (c) => string | Promise<string>, // make a call succeed/throw deterministically
  provider?: IProvider,                             // inject createMockProvider() if needed
})
```

Test helpers:

- `wallet.txLog` — read-only array of all contract requests sent through the wallet.
- `wallet.clearTxLog()` — reset between assertions.
- `wallet.emitAccountChanged(newAddress)` — simulate the extension switching account.

### `createMockProvider(options?)`

A thin stub of `KleverProvider`. Implements only the read methods exercised by
the read-side examples — anything else throws a helpful error so a test that
needs more is forced to declare it.

```ts
import { createMockProvider } from '../../../_shared/mock-wallet'

const provider = createMockProvider({
  accounts: {
    'klv1abc...': {
      KLV: { balance: 1_000_000_000n, precision: 6 },
      'MTT-ABCD-1A': { balance: 100n, precision: 0 },
    },
  },
})

await provider.getBalance('klv1abc...') // 1_000_000_000n
await provider.getAccount('klv1abc...') // { ...assets }
```

Methods provided:

- `getNetwork()`
- `getBlockNumber()`
- `getAccount(address)`
- `getBalance(address, asset?)`
- `getNonce(address)`

Calls to anything else (`sendRawTransaction`, `queryContract`, `waitForTransaction`,
etc.) throw a clear "not mocked" error.

## Why no React render helper here?

The earlier draft of this folder tried to bake in an RTL `renderWithKleverContext`
helper, but that pulled `@klever/connect-react/dist/context.js` — a sub-package
import, which violates the umbrella-only rule (FLOW-INVENTORY §6.1 Q6). The
reactjs/\* tests instead build a tiny per-example wrapper that mounts a real
`<KleverProvider>` with the MockWallet wired through, or stub the hook return
values via `vi.mock('@klever/connect')`.

## Imports — umbrella only

Every type used by `MockWallet` (`Wallet`, `Transaction`, `TransferRequest`,
`ContractRequestData`, `TransactionSubmitResult`, `IProvider`, `Signature`,
`WalletEvent`, `WalletEventHandler`) is imported from the umbrella
`@klever/connect`, in keeping with the settled rule for this examples library.

## Live testnet tests

The `*.testnet.test.ts` files in each example **do not** use this helper. They
spin up the real `KleverProvider` against a real testnet endpoint and a real
wallet (signed by an env private key for `nodejs/`, or the actual extension for
`reactjs/`). Those tests are excluded from CI per the repo policy in
`CLAUDE.md`.

## TypeScript types reference

```ts
import type {
  // From @klever/connect (umbrella):
  Wallet, // interface MockWallet implements (subset)
  IProvider, // interface createMockProvider returns
  Transaction, // arg/return of signTransaction etc.
  TransferRequest, // arg of transfer()
  ContractRequestData, // arg of sendTransaction(), entries of txLog
  TransactionSubmitResult, // return of transfer/sendTransaction
  Signature, // return of signMessage
} from '@klever/connect'
```
