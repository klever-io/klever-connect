# unjail-validator (Node.js)

Unjail a previously jailed validator via contractType 10 (`Unjail`).

## Configuration

| Variable | Required | Notes |
|---|---|---|
| `PRIVATE_KEY` | yes | Hex Ed25519 key of the operator. |
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
npm run test:testnet
```

## Gotchas

- The chain identifies the validator from the signing address — NOT from a
  request field. Always sign with the operator key.
- Some networks impose a cooldown after jailing; broadcasting Unjail before
  the cooldown elapses is rejected.
- The validator only returns to the active set at the next epoch transition.
- This transaction may incur a higher fee than a plain transfer; ensure the
  operator has enough KLV to cover it.
