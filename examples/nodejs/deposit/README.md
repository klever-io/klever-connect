# deposit (Node.js)

Deposit into an FPR (validator) pool or a KDA reward pool via contractType 23
(`Deposit`).

## FPR vs KDA pool

| `DEPOSIT_TYPE` | Recipient | Typical use |
|---|---|---|
| `0` (FPR) | Validator's reward pool | Validators top up payouts to delegators each epoch. |
| `1` (KDA) | Specific KDA's reward pool | Project teams seed APR/rewards for staked tokens. |

For KDA deposits, `KDA_ID` is required. For FPR deposits the chain assigns the
reward to the validator linked to the depositor's address (or the configured
default).

## Configuration

See `.env.example`. Required: `PRIVATE_KEY`, `AMOUNT`. Plus `KDA_ID` if
`DEPOSIT_TYPE=1`.

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

- `AMOUNT` is in **raw smallest units** (10000000 = 10 KLV at 6 decimals).
  For KDAs with a different precision, use `parseUnits(value, decimals)`.
- For KDA deposits, the destination KDA must already have a staking config
  (set up via `kda-create-fungible` with a `staking:` block, or via
  `assetTrigger` updates).
- Depositing into the wrong pool (e.g. KDA-id mismatch) is rejected at chain
  level — verify the asset id before broadcasting.
