# sc-deploy-and-interact-end-to-end (Node.js)

End-to-end smart contract lifecycle on Klever:

1. Deploy the `counter` contract via `ContractFactory.deploy()`.
2. Resolve the deployed address from the receipt.
3. Call `increment` N times via `contract.invoke`.
4. Read state via `contract.call('getCount')`.
5. Parse contract logs with `contract.parseEvents`.

Long-running by design — every step actually hits the chain. Use the simpler
flows 60 / 58 / 59 if you only want to learn one stage.

## Prereqs

- Build the counter fixture: `cd examples/_fixtures/counter && sc-meta all build`.
- PRIVATE_KEY funded with enough KLV.

## Configuration

| Variable | Required | Notes |
|---|---|---|
| `PRIVATE_KEY` | yes | Funded hex Ed25519 key. |
| `WASM_PATH` | no | Defaults to the counter fixture. |
| `ABI_PATH` | no | Defaults to the counter fixture. |
| `INCREMENT_TIMES` | no | Default 3. |
| `KLV_NETWORK` | no | Defaults to `testnet`. |

## Run

```bash
npm install
npm start
```

## Tests

```bash
npm test                                                                # mocked
PRIVATE_KEY=… WASM_PATH=… ABI_PATH=… npm run test:testnet
```

## Gotchas

- The example calls `provider.waitForTransaction(...)` between every step —
  the chain needs the previous tx mined before the next state-changing call
  succeeds (otherwise nonce or state preconditions can fail).
- Each invoke costs a small fee. With `INCREMENT_TIMES=3` you'll spend ~3×
  that. Faucet first via `provider.requestTestKLV(address)` if you're tight on
  test funds.
- `getCount` returns whatever the ABI says — the SDK decodes it for you. The
  example types it as `bigint | number | string` to handle all three common
  cases without committing the docs to one shape.
