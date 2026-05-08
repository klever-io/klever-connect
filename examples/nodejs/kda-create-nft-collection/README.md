# kda-create-nft-collection

Creates a new NFT collection. Identical wire protocol to `kda-create-fungible`
but with `type: 1` (AssetType.NonFungible) and `precision: 0`. After creation
you mint individual NFTs into the collection with the `kda-mint` example.

## What you'll learn

- The single-byte difference between fungible and non-fungible CreateAsset:
  `type: 0` vs `type: 1`.
- Why NFT collections always have `precision: 0`.
- How NFT instance ids look (`TICKER-XXXX/<nonce>`).
- That collection-level properties (`canMint`, `canBurn`, `canPause`) gate every
  later asset-trigger flow.

## Prerequisites

- Funded testnet wallet (CreateAsset fee).
- Knowledge that **royalty configuration is a SEPARATE call** — see flow 33.

## Environment variables

| Name | Required | Default | Description |
|---|---|---|---|
| `KLV_PRIVATE_KEY` | yes | — | Owner. |
| `KLV_NFT_NAME` | no | `MyNFTCollection` | Alphanumeric. |
| `KLV_NFT_TICKER` | no | `MNFT` | Alphanumeric. |
| `KLV_NFT_MAX_SUPPLY` | no | `10000` | Max NFTs (smallest units). `0` = unlimited. |
| `KLV_NFT_LOGO` | no | — | Logo URL. |
| `KLV_NETWORK` | no | `testnet` | Network. |

## Run

```bash
cd examples/nodejs/kda-create-nft-collection
npm install
cp .env.example .env
npm start
```

## Tests

| Command | What it does |
|---|---|
| `npm test` | Mocked happy + logo-set branch. |
| `RUN_TESTNET=1 npm run test:testnet` | Live CreateAsset of an NFT collection. |

## Gotchas

- Same fee gotchas as `kda-create-fungible`. CreateAsset is expensive.
- Properties are immutable for some toggles after creation — set them
  generously up-front.
- Royalty config is NOT a property of CreateAsset. Use `kda-set-royalties`
  (Flow 33) after the collection is live.

## Related flows

- `kda-create-fungible` — fungible variant.
- `kda-mint` — mint individual NFTs into the collection.
- `kda-set-royalties` — configure on-chain royalties.
- `send-nft-transfer-with-royalties` — transfer an NFT with royalties.
