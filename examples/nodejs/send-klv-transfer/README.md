# send-klv-transfer

Send 1 KLV (or any amount via `KLV_AMOUNT`) from a Node-side wallet to a recipient.

## What you'll learn

- The "hello world" of Klever transfers: provider → wallet → `transfer({...})`.
- How `parseKLV(...)` turns human-readable amounts into 6-decimal smallest units.
- How to validate user-supplied recipient addresses with `isValidAddress`.
- How to optionally wait for on-chain confirmation via `result.wait()`.

## Prerequisites

- Node.js 20+ and npm.
- A **funded testnet** wallet whose hex private key you place in `KLV_PRIVATE_KEY`.
  Get free testnet KLV from the Klever testnet faucet before running.

## Environment variables

| Name | Required | Default | Description |
|---|---|---|---|
| `KLV_PRIVATE_KEY` | yes | — | 64-hex-char Ed25519 private key of the sender. |
| `KLV_RECIPIENT` | no | sender's own address | Recipient bech32 address (`klv1...`). |
| `KLV_NETWORK` | no | `testnet` | `mainnet` / `testnet` / `devnet`. |
| `KLV_AMOUNT` | no | `1` | Amount of KLV to send (human-readable). |

You can also pass the recipient as the first CLI argument:
`npm start -- klv1recipient...`

## Run

```bash
cd examples/nodejs/send-klv-transfer
npm install
cp .env.example .env   # add KLV_PRIVATE_KEY and optionally KLV_RECIPIENT
npm start
```

## Tests

| Command | What it does |
|---|---|
| `npm test` | Mocked happy-path + invalid-recipient edge case. CI-safe. |
| `RUN_TESTNET=1 npm run test:testnet` | Sends 1 smallest unit to self on real testnet. |

## Gotchas

- Never run with a mainnet private key on the wrong terminal — keep `KLV_NETWORK=testnet`
  by default and switch only with intent.
- A `WalletError: Failed to transfer: ...` usually means insufficient balance or a
  dropped nonce. Re-fund the wallet or wait for the previous tx to land.
- If you call `wallet.transfer` immediately after another tx, the second call may
  reuse the previous nonce. For batch sends, build txs manually with explicit nonces.

## Related flows

- `send-kda-transfer` — same flow but specifies `kda` to send a KDA token.
- `send-nft-transfer-with-royalties` — NFT transfers with royalties.
- `tx-poll-until-confirmed` (other agent) — wait for confirmation deterministically.
