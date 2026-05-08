# kda-set-royalties

Configures the royalty schedule for a KDA (typically an NFT collection).
AssetTrigger, `triggerType: 14` (UpdateRoyalties).

## What you'll learn

- The royalties payload shape: receiver address + transfer schedule + market schedule.
- Basis points: `10000 = 100.00%`. `500 = 5.00%`.
- That royalties are enforced chain-side on every transfer (Flow 19) and
  marketplace sale.

## Environment variables

| Name | Required | Default | Description |
|---|---|---|---|
| `KLV_PRIVATE_KEY` | yes | — | Asset owner. |
| `KLV_KDA_ID` | yes | — | Asset id (NFT collection typical). |
| `KLV_ROYALTIES_ADDRESS` | yes | — | Royalty recipient bech32. |
| `KLV_ROYALTIES_TRANSFER_PERCENTAGE` | no | `500` | bps on each transfer. |
| `KLV_ROYALTIES_TRANSFER_FIXED` | no | `0` | Fixed amount on each transfer. |
| `KLV_ROYALTIES_MARKET_PERCENTAGE` | no | `500` | bps on each marketplace sale. |
| `KLV_ROYALTIES_MARKET_FIXED` | no | `0` | Fixed amount on each marketplace sale. |
| `KLV_NETWORK` | no | `testnet` | Network. |

## Run

```bash
cd examples/nodejs/kda-set-royalties
npm install
cp .env.example .env
npm start
```

## Tests

| Command | What it does |
|---|---|
| `npm test` | Mocked happy + invalid-address branches. |
| `RUN_TESTNET=1 npm run test:testnet` | Live update (asset must allow royalty changes). |

## Gotchas

- The asset must have been created with `canChangeRoyaltiesReceiver: true`
  (or equivalent — check the asset's properties).
- Calling `triggerType: 16` (StopRoyaltiesChange) locks the schedule permanently.
- Market and transfer schedules are independent. Set both deliberately.

## Related flows

- `kda-create-nft-collection`, `send-nft-transfer-with-royalties`.
