# `tx-serialize-deserialize` — Flow #16

`Transaction.toHex()` / `Transaction.fromHex()` — the building blocks for any
"build here, sign there" workflow: hardware signers, QR-code transport,
air-gapped signing.

## What you learn

- `tx.toHex()` — serialize a `Transaction` to a 0x-less hex string.
- `Transaction.fromHex(hex)` — recover a `Transaction` from hex.
- The round trip is **byte-exact** — `Transaction.fromHex(tx.toHex()).toHex() === tx.toHex()`.
- Why hex is the de-facto interchange format for proto-encoded txs.

## Run

```bash
npm install
cp .env.example .env
npm start
```

## Tests

```bash
npm test              # offline buildProto round-trip
npm run test:testnet  # live build, then round-trip
```

## Gotchas

- Signing is intentionally NOT shown here — it requires a private key, which
  pulls us into `nodejs/`. See `nodejs/send-klv-transfer/`.
- A signed tx serializes the signature too, so `Transaction.fromHex` of a
  signed-tx hex gives you back the signed tx. You can therefore ship the
  signature back with the proto in one round.
- On older SDK versions `buildProto` did not encode contract parameters fully.
  This SDK build does — the round-trip test covers it.
