# send-nft-transfer-with-royalties

Transfer an NFT and pay royalties to the collection's royalty receiver.

## What you'll learn

- How NFT identifiers are encoded as `COLLECTION-XXXX/<nonce>`.
- The two royalty fields on a Transfer request: `klvRoyalties` (native) and
  `kdaRoyalties` (in the transferred KDA itself).
- Why amount is always `1n` for an NFT.

## Prerequisites

- A funded testnet wallet that owns the NFT identified by `KLV_NFT_ID`.
- Enough KLV for the network fee plus any royalties you choose to pay.

## Environment variables

| Name | Required | Default | Description |
|---|---|---|---|
| `KLV_PRIVATE_KEY` | yes | — | Sender hex key. |
| `KLV_NFT_ID` | yes | — | NFT id, format `COLLECTION-XXXX/<nonce>`. |
| `KLV_RECIPIENT` | yes (env or argv[2]) | — | Recipient bech32 address. |
| `KLV_ROYALTIES_KLV` | no | `0` | KLV royalties paid alongside the transfer (smallest units). |
| `KLV_ROYALTIES_KDA` | no | `0` | KDA royalties (in the same KDA as the NFT). |
| `KLV_NETWORK` | no | `testnet` | Network. |

## Run

```bash
cd examples/nodejs/send-nft-transfer-with-royalties
npm install
cp .env.example .env
npm start
# or:
npm start -- klv1somerecipient...
```

## Tests

| Command | What it does |
|---|---|
| `npm test` | Mocked test asserting royalty fields are forwarded. |
| `RUN_TESTNET=1 npm run test:testnet` | Live transfer (requires `KLV_NFT_ID` you own). |

## Gotchas

- Collection-mandated royalty minimums are validated chain-side. If you under-pay,
  the broadcast will fail with a contract error. Read the collection's metadata
  (or its `RoyaltiesInfo` via `kda-set-royalties`) before transferring.
- Don't confuse the two royalty fields. `klvRoyalties` is in KLV smallest units;
  `kdaRoyalties` is in the SAME asset being transferred (rarely useful for NFTs
  since their nonce amount is 1, but valid for semi-fungible tokens).
- The umbrella does not currently export `createTransferWithRoyalties`. Build the
  params object inline, as shown in `src/index.ts`.

## Related flows

- `send-kda-transfer` — KDA transfer without royalties.
- `kda-create-nft-collection` — create the collection you'll mint NFTs into.
- `kda-set-royalties` — configure the royalty schedule on a collection.
