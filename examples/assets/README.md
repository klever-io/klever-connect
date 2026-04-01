# Asset Examples

Creating and managing KDA (Klever Digital Asset) tokens.

## Examples

### `create-asset.ts` — Create a new KDA token

Issues a new fungible token with supply caps, properties, and URIs. Also shows how to create an NFT collection.

```bash
PRIVATE_KEY=your_hex_key npx tsx create-asset.ts
```

### `asset-trigger.ts` — Manage an existing KDA

Mint, burn, grant roles, and update metadata on a KDA you own.

```bash
PRIVATE_KEY=your_hex_key ASSET_ID=MTT-XXXX-1A npx tsx asset-trigger.ts
```
