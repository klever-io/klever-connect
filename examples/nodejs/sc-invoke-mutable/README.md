# sc-invoke-mutable (Node.js)

Invoke a mutable (state-changing) function on a deployed smart contract via
`Contract.invoke(...)`.

## Counter fixture

This example uses the `counter` Rust contract under
`examples/_fixtures/counter/`. Build it before running live:

```bash
cd examples/_fixtures/counter
sc-meta all build
# Produces ./output/counter.wasm and ./output/counter.abi.json
```

If you don't yet have the Rust toolchain, the mocked vitest still passes —
only the live testnet path requires real artifacts.

## Configuration

| Variable | Required | Notes |
|---|---|---|
| `PRIVATE_KEY` | yes | Hex Ed25519 key. |
| `CONTRACT_ADDRESS` | yes | klv1qqq… address from a previous deploy. |
| `ABI_PATH` | no | Defaults to `../_fixtures/counter/output/counter.abi.json`. |
| `FUNCTION_NAME` | no | Defaults to `increment`. |
| `FUNCTION_ARGS` | no | Comma-separated string args for functions that take input. |
| `KLV_NETWORK` | no | Defaults to `testnet`. |
| `DRY_RUN` | no | `true` (default) prints the call without sending. |

## Run

```bash
npm install
npm start
```

## Tests

```bash
npm test
PRIVATE_KEY=… CONTRACT_ADDRESS=… npm run test:testnet
```

## Gotchas

- `Contract.invoke` rejects readonly functions — use `Contract.call(...)` for
  reads. The error message tells you which.
- The argument types must match the ABI. The ABI parser accepts strings and
  coerces them per the declared input type; for complex types (struct, enum)
  you may need to pass already-encoded `Uint8Array`s.
- For payable functions, see flow 59 (`sc-invoke-payable-with-klv`).
- For full deploy + invoke + query lifecycle, see flow 63
  (`sc-deploy-and-interact-end-to-end`).
