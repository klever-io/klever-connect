# kda-add-role

Grants `hasRoleMint` and/or `hasRoleSetITOPrices` to another address. Only the
asset owner can call this, and only when the asset was created with
`canAddRoles: true`.

## What you'll learn

- AddRole is `triggerType: 6` of AssetTrigger.
- The role payload shape: `{ address, hasRoleMint, hasRoleSetITOPrices }`.
- The relationship between asset properties (`canMint`, `canAddRoles`) and roles.

## Environment variables

| Name | Required | Default | Description |
|---|---|---|---|
| `KLV_PRIVATE_KEY` | yes | — | Asset owner's hex key. |
| `KLV_KDA_ID` | yes | — | Asset id. |
| `KLV_ROLE_ADDRESS` | yes | — | Grantee bech32. |
| `KLV_ROLE_MINT` | no | `1` | `1` to grant mint, `0` to skip. |
| `KLV_ROLE_SET_ITO_PRICES` | no | `0` | `1` to grant ITO-price-setting. |
| `KLV_NETWORK` | no | `testnet` | Network. |

## Run

```bash
cd examples/nodejs/kda-add-role
npm install
cp .env.example .env
npm start
```

## Tests

| Command | What it does |
|---|---|
| `npm test` | Mocked happy + invalid-grantee branches. |
| `RUN_TESTNET=1 npm run test:testnet` | Live grant of mint role. |

## Gotchas

- Asset must have been created with `canAddRoles: true`. This is immutable.
- Roles are additive across multiple AddRole calls — call again with different
  flags to layer privileges.
- To revoke, send `triggerType: 7` (RemoveRole) — outside the scope of this example.

## Related flows

- `kda-create-fungible`, `kda-mint`, `kda-burn`, `kda-pause-resume`.
