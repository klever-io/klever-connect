# `tx-receipt-parse` — Flow #56

Decode a transaction's tagged receipts (Freeze -> bucketId, Delegate ->
amount, Transfer -> from/to/value, etc.) using `parseReceipt`.

## Umbrella import gap

`parseReceipt` lives in `@klever/connect-provider` and is not (yet)
re-exported by the umbrella `@klever/connect`. This example imports it
directly from the sub-package as a documented exception.

## What you learn

- Transaction receipts are heterogeneous. The shape depends on the contract
  type that produced them.
- `parseReceipt(raw)` dispatches on the `type` field and returns a tagged
  union of typed payloads (`FreezeReceiptData`, `DelegateReceiptData`,
  `TransferReceiptData`, ...).
- A Freeze tx returns the `bucketId` you'll need for subsequent Delegate /
  Withdraw calls — pulled out of the receipt, not the tx itself.

## Run

```bash
npm install
cp .env.example .env
# Set KLV_TX_HASH to a tx hash whose receipt you want to inspect.
npm start
```

## Tests

```bash
npm test              # mocked, exercises a few canonical receipt shapes
npm run test:testnet  # only runs if KLV_TX_HASH is set
```

## Related

- Build the txs in the first place: `nodejs/freeze-for-staking/`,
  `nodejs/delegate-to-validator/`, etc.
- Read-only bucket inspection without a tx: `../bucket-list-and-status/`.
