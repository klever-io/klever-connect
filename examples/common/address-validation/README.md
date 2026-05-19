# `address-validation` — Flow #2

Validate user-supplied Klever addresses with three increasingly strict checks
the SDK exposes.

## What you learn

- **`isKleverAddress`** — fast regex check (`klv1` prefix + bech32 character
  set + length). Use this for cheap UI feedback.
- **`isValidAddress`** — full bech32 decode + checksum verification. Use this
  before submitting anything to the node.
- **`createKleverAddress`** — validate-and-brand. Returns the value typed as
  the branded `KleverAddress`, which is what the rest of the SDK expects.
- The validate-then-brand idiom (`safeBrand`) you'll copy-paste into your own
  forms.

## Prerequisites

None.

## Environment variables

| Variable          | Required | Description                                        |
| ----------------- | -------- | -------------------------------------------------- |
| `KLEVER_ADDRESS`  | no       | If set, the example also classifies this address. |

## Run

```bash
npm install
npm start
```

## Tests

```bash
npm test              # mocked (CI-safe, pure function tests)
npm run test:testnet  # checks the SDK validators agree with the live RPC
```

## What to expect

See [`EXPECTED_OUTPUT.md`](./EXPECTED_OUTPUT.md).

## Gotchas

- `createKleverAddress` **throws** on a bad address. Wrap it in `safeBrand` (or
  similar) when handling untrusted input.
- The regex is intentionally cheap — it does NOT detect bad checksums. Don't
  use `isKleverAddress` alone before broadcasting.
- The bech32 prefix is hard-coded to `klv` in the SDK. If you're testing
  against a network that uses a different prefix, you'll need a custom
  validator.
