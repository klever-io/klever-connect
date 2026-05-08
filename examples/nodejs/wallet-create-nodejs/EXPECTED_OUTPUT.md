# Expected output — wallet-create-nodejs

With `KLV_PRIVATE_KEY` set, all three paths execute and you see something like:

```text
Provider network: testnet

Path 1 — NodeWallet from env-supplied private key
  - address:    klv1<deterministic-from-your-key>
  - publicKey:  <64-hex-chars>
  - connected:  true

Path 2 — NodeWallet.generate (random key)
  - address:    klv1<random>
  - publicKey:  <64-hex-chars>
  - valid?      true

Path 3 — WalletFactory.createRandom
  - address:    klv1<random>
  - publicKey:  <64-hex-chars>
  - typeof:     NodeWallet

Done. All three NodeWallet construction paths exercised.
```

If `KLV_PRIVATE_KEY` is not set, Path 1 prints `skipped (set KLV_PRIVATE_KEY in .env to enable)`
and only paths 2 and 3 run.
