# sc-deploy (Node.js)

Deploy a compiled WASM smart contract via `ContractFactory`.

## Counter fixture

Build the counter contract once before running this example:

```bash
cd examples/_fixtures/counter
sc-meta all build
# Produces ./output/counter.wasm and ./output/counter.abi.json
```

The mocked vitest does NOT require these artifacts. The live testnet path
does.

## Configuration

| Variable | Required | Notes |
|---|---|---|
| `PRIVATE_KEY` | yes | Hex Ed25519 key. |
| `WASM_PATH` | no | Defaults to `../_fixtures/counter/output/counter.wasm`. |
| `ABI_PATH` | no | Defaults to `../_fixtures/counter/output/counter.abi.json`. |
| `CONSTRUCTOR_ARGS` | no | Comma-separated string args. |
| `META_UPGRADEABLE` | no | Default `true`. |
| `META_READABLE` | no | Default `true`. |
| `META_PAYABLE` | no | Default `false`. |
| `META_PAYABLE_BY_SC` | no | Default `false`. |
| `KLV_NETWORK` | no | Defaults to `testnet`. |

## Run

```bash
npm install
npm start
```

## Tests

```bash
npm test
PRIVATE_KEY=… npm run test:testnet
```

## Gotchas

- `factory.deploy` returns a `Contract` whose `.address` is a placeholder
  zero-address until you read the receipt. Always call
  `ContractFactory.getDeployedAddress(receipt)` to get the real address.
- Set `META_PAYABLE=true` BEFORE deploying if you intend to use flow 59
  (`sc-invoke-payable-with-klv`). You can't toggle this after the fact unless
  the contract is upgradeable.
- For the full deploy → invoke → query → events lifecycle, see flow 63
  (`sc-deploy-and-interact-end-to-end`).
