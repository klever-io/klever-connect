# account-permissions-update (Node.js)

Build (and optionally broadcast) an `UpdateAccountPermission` transaction
(contractType 22) — the Klever primitive for multi-sig and weighted account
permissions.

## Why this example MAY stop at "build"

Once an account is multi-sig (threshold > 1, multiple signers), every
subsequent transaction needs aggregated signatures from enough signers to meet
the threshold. That coordination is a multi-party flow that doesn't fit a
single-binary example. This example therefore:

1. **Always** builds + signs the request.
2. **Conditionally** broadcasts when `BROADCAST_SINGLE_SIGNED=true` — useful
   for the INITIAL setup (the account is still single-sig when this tx is
   broadcast, so a single signature suffices).

## Configuration

| Variable | Required | Notes |
|---|---|---|
| `PRIVATE_KEY` | yes | Hex Ed25519 key of the account being updated. |
| `PERMISSIONS_JSON` | yes | Array of `PermissionRequest` objects. |
| `KLV_NETWORK` | no | Defaults to `testnet`. |
| `BROADCAST_SINGLE_SIGNED` | no | `false` (default). Set to `true` for the initial setup transaction only. |

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

- `operations` is a hex bitmap describing which contract types this permission
  can authorize. Use `"0x000000"` (all-zero, conventionally "all") unless
  you specifically want to scope this permission.
- `threshold` and `weight` are `AmountLike` (string / number / bigint). Use
  strings for clarity and to avoid JS number precision issues.
- Once you publish a multi-sig threshold, you cannot single-sig your way out —
  always plan a recovery path (e.g. a higher-weight emergency signer).
- This is a Node.js example. The same contract type 22 is also reachable from
  React via the wallet extension.
