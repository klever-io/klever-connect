# kda-pause-resume

Pauses or resumes all transfers of a KDA. One folder, two npm scripts.

| Script | What it does | triggerType |
|---|---|---|
| `npm run pause` | Block all transfers of `KLV_KDA_ID`. | 3 |
| `npm run resume` | Re-allow transfers. | 4 |
| `npm start` | Alias for `npm run pause`. | 3 |

`tsx src/index.ts <pause|resume>` underneath, so you can also pass the action
positionally: `npm start -- resume`.

## Environment variables

| Name | Required | Default | Description |
|---|---|---|---|
| `KLV_PRIVATE_KEY` | yes | — | Asset owner. |
| `KLV_KDA_ID` | yes | — | Asset id to pause/resume. |
| `KLV_NETWORK` | no | `testnet` | Network. |

## Run

```bash
cd examples/nodejs/kda-pause-resume
npm install
cp .env.example .env

# Pause:
npm run pause

# ...and later resume:
npm run resume
```

## Tests

| Command | What it does |
|---|---|
| `npm test` | Mocked test asserting both action branches. |
| `RUN_TESTNET=1 npm run test:testnet` | Live pause+resume cycle. |

## Gotchas

- The asset must have been created with `canPause: true`. Immutable after CreateAsset.
- A paused asset blocks all Transfers AND all AssetTrigger calls except Resume.
- If you "lose the key" while the asset is paused, the asset is permanently frozen.
  Make extra sure you can resume before pausing.

## Related flows

- `kda-create-fungible`, `kda-create-nft-collection`, `kda-add-role`.
