# kda-mint

Mints additional fungible supply OR mints a single NFT into a non-fungible
collection. Both modes use AssetTrigger with `triggerType: 0`.

## What you'll learn

- That AssetTrigger is `contractType: 11` and Mint is `triggerType: 0`.
- That the same call mints a fungible amount OR a NFT depending on the asset.
- That the wallet needs the mint role (or be the owner).

## Modes

### Fungible mint (default)

Provide `KLV_KDA_ID` (the asset id) and `KLV_MINT_AMOUNT` (smallest units).
Optionally `KLV_MINT_RECEIVER` to credit somebody else.

### NFT mint

Set `KLV_MINT_MODE=nft` and `KLV_KDA_ID` to the COLLECTION id. The chain
assigns the next nonce and emits the NFT id (`COLLECTION/<nonce>`) in the receipt.
You can attach `KLV_MINT_NFT_URIS` (JSON) and `KLV_MINT_NFT_MIME`.

## Environment variables

| Name | Required | Default | Description |
|---|---|---|---|
| `KLV_PRIVATE_KEY` | yes | — | Owner or mint-role grantee. |
| `KLV_KDA_ID` | yes | — | Asset id (or NFT collection id). |
| `KLV_MINT_MODE` | no | `fungible` | `fungible` \| `nft`. |
| `KLV_MINT_AMOUNT` | no (fungible) | `1000000` | Amount in smallest units. |
| `KLV_MINT_RECEIVER` | no | sender | Recipient. |
| `KLV_MINT_NFT_URIS` | no | sample | JSON map of URIs (NFT mode). |
| `KLV_MINT_NFT_MIME` | no | — | MIME type (NFT mode). |
| `KLV_NETWORK` | no | `testnet` | Network. |

## Run

```bash
cd examples/nodejs/kda-mint
npm install
cp .env.example .env
npm start
```

## Tests

| Command | What it does |
|---|---|
| `npm test` | Mocked fungible + NFT-mode branches. |
| `RUN_TESTNET=1 npm run test:testnet` | Live fungible mint of 1 unit. |

## Gotchas

- "Cannot mint" usually means the asset's `canMint` flag was false at creation,
  or your wallet lacks the mint role. Run `kda-add-role` first.
- For `maxSupply`-bounded assets, minting past the cap fails on-chain.
- When minting NFTs, `KLV_KDA_ID` is the collection id, NOT a specific nonce.

## Related flows

- `kda-create-fungible`, `kda-create-nft-collection` — create the asset first.
- `kda-burn` — destroy supply.
- `kda-add-role` — grant mint role to others.
