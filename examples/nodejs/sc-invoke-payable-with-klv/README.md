# sc-invoke-payable-with-klv (Node.js)

Invoke a payable smart contract function while sending KLV alongside via
`contract.invoke(fn, args, { value: { KLV: parseKLV('10') } })`.

## Configuration

| Variable | Required | Notes |
|---|---|---|
| `PRIVATE_KEY` | yes | Hex Ed25519 key. |
| `CONTRACT_ADDRESS` | yes | klv1qqq… address from a previous deploy. |
| `ABI_PATH` | no | Defaults to the counter fixture (replace for a real payable contract). |
| `FUNCTION_NAME` | no | Defaults to `topUp`. |
| `FUNCTION_ARGS` | no | Comma-separated. |
| `KLV_AMOUNT` | no | Human KLV (parseKLV applied). Default `10`. |
| `KLV_NETWORK` | no | Defaults to `testnet`. |
| `DRY_RUN` | no | `true` (default). |

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

- The contract MUST be deployed `payable: true` and the function must accept
  payment. Calling a non-payable endpoint with `value` is rejected at chain
  level.
- Use `value: { KLV: parseKLV('10') }` for KLV. For KDAs use the KDA's id as
  the key: `value: { KFI: 1_000_000n }`. Multi-asset payment is supported in a
  single call.
- The amount is **raw smallest units**. Use `parseKLV(...)` for KLV and
  `parseUnits(value, decimals)` for arbitrary KDAs.
