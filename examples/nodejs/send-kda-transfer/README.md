# send-kda-transfer

Sends a KDA token (fungible or NFT nonce) to a recipient. The wire-level
transaction is still a Transfer (contractType=0); the chain switches ledgers
based on the `kda` field.

## What you'll learn

- How to specify a KDA in a transfer: `wallet.transfer({ receiver, amount, kda })`.
- Why `parseKLV` is the wrong helper for KDAs (it assumes 6 decimals).
- How to address a specific NFT nonce as `COLLECTION-XXXX/<nonce>`.

## Prerequisites

- A funded testnet wallet that owns some balance of `KLV_KDA_ID`, plus enough
  KLV to pay the network fee.
- `KLV_KDA_ID` set to a known testnet asset (you can create one with the
  `kda-create-fungible` example in this folder).

## Environment variables

| Name | Required | Default | Description |
|---|---|---|---|
| `KLV_PRIVATE_KEY` | yes | — | Sender's hex Ed25519 key. |
| `KLV_KDA_ID` | yes | — | Asset id, e.g. `MTT-ABCD` or `MNFT-ABCD/1` for an NFT. |
| `KLV_RECIPIENT` | no | sender's address | Recipient bech32 address. |
| `KLV_AMOUNT` | no | `1` | Amount in **smallest units** for the asset. |
| `KLV_NETWORK` | no | `testnet` | Network to broadcast on. |

## Run

```bash
cd examples/nodejs/send-kda-transfer
npm install
cp .env.example .env
npm start
```

## Tests

| Command | What it does |
|---|---|
| `npm test` | Mocked happy path + missing-asset-id edge case. |
| `RUN_TESTNET=1 npm run test:testnet` | Live self-send of 1 unit of `KLV_KDA_ID`. |

## Gotchas

- The amount is in **smallest units of the asset**. For a 6-decimal token, "1.5"
  is `1500000`. For an NFT, always `1`.
- Passing `kda: 'KLV'` works but is redundant — omit `kda` for native KLV.
- For royalty-bearing NFTs, see `send-nft-transfer-with-royalties`.

## Related flows

- `send-klv-transfer` — native KLV transfer.
- `send-nft-transfer-with-royalties` — NFT transfer with royalty payments.
- `kda-create-fungible` / `kda-create-nft-collection` — create the assets you'll send.
