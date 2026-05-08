# account-set-name (Node.js)

Set a human-readable alias on a Klever account via contractType 12
(`SetAccountName`), then optionally verify the change by re-fetching the
account from the provider.

## Configuration

| Variable | Required | Notes |
|---|---|---|
| `PRIVATE_KEY` | yes | Hex Ed25519 key. |
| `ACCOUNT_NAME` | yes | UTF-8 alias to set. |
| `KLV_NETWORK` | no | Defaults to `testnet`. |
| `DRY_RUN` | no | `true` (default) — sign without broadcasting. |
| `VERIFY_AFTER_BROADCAST` | no | `true` (default) — re-fetch account to confirm. |

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

- Names typically have a length cap and character whitelist defined by chain
  parameters; if the chain rejects an otherwise valid-looking alias, check
  those rules.
- The chain enforces uniqueness on aliases: if the desired name is already
  taken, the transaction is rejected.
- The verification step uses `provider.waitForTransaction(hash)`. The default
  poll interval is sane for testnet but can be tuned via the provider config.
