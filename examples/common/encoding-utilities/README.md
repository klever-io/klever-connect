# `encoding-utilities` — Flow #5

Hex, base58, base64, bech32, BLAKE2b — every encoding helper the SDK ships,
exercised in one short demo.

## Umbrella import gap

These helpers are shipped in `@klever/connect-encoding` and are **not yet**
re-exported by the umbrella `@klever/connect`. This example uses
`@klever/connect-encoding` directly as a documented exception (see
`FLOW-INVENTORY.md §6.1 Q6`). Track the follow-up under KLC-2322 — once the
umbrella re-exports them, switch the import in `src/index.ts`.

## What you learn

- `hexEncode` / `hexDecode` (with optional `0x` prefix).
- `base58Encode` / `base58Decode`.
- `base64Encode` / `base64Decode` (cross-platform — Node, browser, RN).
- `bech32Encode(bytes, 'klv')` / `bech32Decode(addr)` — Klever address codec.
- `encodeHex(utf8)` — UTF-8 string -> 0x-prefixed hex (used for SC function names).
- `hashBlake2b(data, length=32)` — the SDK's hash of choice.

## Run

```bash
npm install
npm start
```

## Tests

```bash
npm test              # round-trip and shape tests
npm run test:testnet  # bech32-decodes a real Klever address
```

## Gotchas

- `hexDecode` accepts an optional `0x` prefix; `hexEncode` does NOT add one.
- `bech32Encode` defaults to the `klv` prefix. Pass a different prefix to
  encode for other ecosystems.
- `hashBlake2b` accepts a `len` parameter; common sizes are 20 (160 bits, used
  for tx hashes in some legacy paths) and 32 (256 bits, the default).
