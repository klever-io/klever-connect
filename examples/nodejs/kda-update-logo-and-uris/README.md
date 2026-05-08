# kda-update-logo-and-uris

Updates a KDA's logo and URI map. Two AssetTrigger calls:

- triggerType 10 (UpdateLogo) — replaces `logo` field
- triggerType 11 (UpdateURIs) — replaces the entire URI map

The example awaits confirmation between the two calls so the second tx doesn't
race the first on the same nonce.

## Environment variables

| Name | Required | Default | Description |
|---|---|---|---|
| `KLV_PRIVATE_KEY` | yes | — | Asset owner. |
| `KLV_KDA_ID` | yes | — | Asset id. |
| `KLV_KDA_LOGO` | no | sample | New logo URL. Empty string skips. |
| `KLV_KDA_URIS` | no | sample | JSON map. `{}` skips. |
| `KLV_NETWORK` | no | `testnet` | Network. |

## Run

```bash
cd examples/nodejs/kda-update-logo-and-uris
npm install
cp .env.example .env
npm start
```

## Tests

| Command | What it does |
|---|---|
| `npm test` | Mocked happy path + invalid-JSON branch. |
| `RUN_TESTNET=1 npm run test:testnet` | Live UpdateLogo. |

## Gotchas

- UpdateURIs REPLACES the existing map. To add a new URI, include the existing
  ones too.
- Issuing two AssetTriggers in rapid succession without awaiting the first
  confirmation may produce a nonce collision (one tx will be rejected).

## Related flows

- `kda-create-fungible`, `kda-create-nft-collection`, `kda-set-royalties`.
