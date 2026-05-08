# `send-nft-transfer-with-royalties` (React)

Transfer a single Klever NFT and pay an optional KLV / KDA royalty to the
issuer.

## What this shows

- The NFT id format on Klever: `COLLECTION-XXXX/INDEX`.
- A direct `useTransaction.sendTransaction` call with `contractType:
  TXType.Transfer` and `kda` / `klvRoyalties` / `kdaRoyalties` fields.
- Why we use `parseKLV` for the KLV royalty (decimal string) and a raw
  `BigInt` for the KDA royalty (already in smallest units).

## Prereqs

- Klever Web Extension installed.
- An NFT you actually own. Mint one via the `kda-mint` example or use a
  testnet NFT.

## Run it

```bash
cd examples/reactjs/send-nft-transfer-with-royalties
npm install
cp .env.example .env.local   # set VITE_KLV_NFT_ID=YOURCOLL-A1B2/1 if you like
npm run dev
```

## Tests

```bash
npm test
npm run test:testnet
```

## Gotchas

- NFT precision is always 0 — the SDK enforces `amount: 1` per transfer for
  non-fungible KDAs.
- Royalties are NOT mandatory per protocol; if you set them to zero the
  asset's configured royalty is what actually applies. Use this form to
  *exceed* the minimum.
- Royalties go to the issuer address, not the recipient.
