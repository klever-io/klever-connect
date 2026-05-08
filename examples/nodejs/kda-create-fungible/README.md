# kda-create-fungible

Creates a new fungible Klever Digital Asset (KDA). After confirmation, your token's
id is `TICKER-XXXX` (4-character hex suffix), visible on the explorer.

## What you'll learn

- That CreateAsset is `contractType: 1` and the `type` discriminator selects
  fungible (`0`), NFT (`1`), or semi-fungible (`2`).
- The asset properties matrix (canMint, canBurn, canPause, canFreeze, …).
- Why naming rules matter (alphanumeric only — bech32 collision avoidance).

## Prerequisites

- Funded testnet wallet. **CreateAsset has a non-trivial fee** — check the
  current `CreateAssetCost` parameter on the explorer or via
  `provider.getNetwork()` before running.

## Environment variables

| Name | Required | Default | Description |
|---|---|---|---|
| `KLV_PRIVATE_KEY` | yes | — | Owner's hex key. |
| `KLV_KDA_NAME` | no | `MyTestToken` | Asset name (alphanumeric). |
| `KLV_KDA_TICKER` | no | `MTT` | Ticker (alphanumeric). |
| `KLV_KDA_PRECISION` | no | `6` | Decimals. |
| `KLV_KDA_INITIAL_SUPPLY` | no | `1000000000` | Initial supply (smallest units). |
| `KLV_KDA_MAX_SUPPLY` | no | `10000000000` | Max supply. `0` = unlimited (with `canMint`). |
| `KLV_NETWORK` | no | `testnet` | Network. |

## Run

```bash
cd examples/nodejs/kda-create-fungible
npm install
cp .env.example .env
npm start
```

## Tests

| Command | What it does |
|---|---|
| `npm test` | Mocked test asserting the request shape. |
| `RUN_TESTNET=1 npm run test:testnet` | Real CreateAsset broadcast (random ticker). |

## Gotchas

- `name` and `ticker` must be alphanumeric — no spaces.
- `initialSupply <= maxSupply` (when `maxSupply > 0`).
- `precision` cannot be changed after creation.
- The CreateAsset fee is much larger than a normal tx fee. Re-fund your wallet
  generously before running on a fresh account.

## Related flows

- `kda-create-nft-collection` — same mechanism, `type: 1`.
- `kda-mint`, `kda-burn`, `kda-add-role`, `kda-update-logo-and-uris`,
  `kda-pause-resume`, `kda-set-royalties` — manage your asset post-creation.
- `send-kda-transfer` — once the asset exists you can transfer it.
