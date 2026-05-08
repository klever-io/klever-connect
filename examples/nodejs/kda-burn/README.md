# kda-burn

Burns KDA supply, irreversibly removing it from circulation. AssetTrigger,
`triggerType: 1`.

## What you'll learn

- Burn is `triggerType: 1` of `contractType: 11` (AssetTrigger).
- The wallet either holds the tokens directly or holds the burn role.
- For NFTs, the asset id is the full `COLLECTION-XXXX/<nonce>` and amount is `1`.

## Environment variables

| Name | Required | Default | Description |
|---|---|---|---|
| `KLV_PRIVATE_KEY` | yes | — | Holder/role grantee. |
| `KLV_KDA_ID` | yes | — | Asset id (full NFT id for NFT burns). |
| `KLV_BURN_AMOUNT` | no | `1000` | Amount in smallest units. `1` for NFTs. |
| `KLV_NETWORK` | no | `testnet` | Network. |

## Run

```bash
cd examples/nodejs/kda-burn
npm install
cp .env.example .env
npm start
```

## Tests

| Command | What it does |
|---|---|
| `npm test` | Mocked happy + missing-id branches. |
| `RUN_TESTNET=1 npm run test:testnet` | Live burn of 1 unit. |

## Gotchas

- Burn is irreversible. There is no on-chain unburn.
- "canBurn" must be true on the asset (set at CreateAsset, immutable).
- Burning more than the holder's balance fails the tx.

## Related flows

- `kda-mint`, `kda-add-role`, `kda-create-fungible`.
