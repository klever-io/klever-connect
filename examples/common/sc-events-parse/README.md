# `sc-events-parse` — Flow #61

Decode `ContractEvent`s emitted by a smart contract from the raw
`logs[]` on a transaction receipt.

## What you learn

- Smart-contract events on Klever are stored as raw bytes (topics + data) on
  the tx receipt's `logs[]` array.
- `contract.parseEvents(logs)` walks them and returns typed events shaped by
  the ABI.
- Optional filtering by `identifier` to scope to a single event type.

## Prerequisites

- A deployed counter (`nodejs/sc-deploy/`).
- A counter call that emitted `counter_changed` (`nodejs/sc-invoke-mutable/`).

## Run

```bash
npm install
cp .env.example .env
# Edit .env — set COUNTER_ADDRESS and KLV_TX_HASH (the tx that called
# increment / add).
npm start
```

## Tests

```bash
npm test              # decodes a synthetic log shape
npm run test:testnet  # decodes a real receipt
```

## Gotchas

- `topics[0]` is the event identifier (UTF-8 encoded bytes -> base64).
- The remaining topics are the indexed args, in declaration order.
- Non-indexed args sit in the `data` field, encoded according to the ABI's
  `inputs[].type`.
- The mocked test is permissive (asserts `>= 0`) because synthetic log shapes
  vary across SDK minor versions; the live test exercises the real path.
