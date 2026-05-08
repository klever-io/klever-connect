# Expected output — csv-bulk-transfer

Given a `recipients.csv` like:

```text
receiver,amount,kda
klv1ALICE…,1,
klv1BOB…,2,
klv1CAROL…,5,KFI
```

Running with `DRY_RUN=true`:

```text
Sender:     klv1qgz9c8r4r8a5g7l9z2tdc6yyy7y0jzn0wprv7h0utzqxvpmmqnwsezuq57
Network:    testnet
Recipients: 3
Batch size: 50
Base nonce: 100
Built and signed 3 transactions.
DRY_RUN=true — not broadcasting. Re-run with DRY_RUN=false to send.
```

With `DRY_RUN=false` and `BATCH_SIZE=2`:

```text
Broadcasting batch 1 (2 txs)...
  [1/3] 7a3b…0f1d
  [2/3] 8b4c…1e2f
Broadcasting batch 2 (1 txs)...
  [3/3] 9c5d…2f30
```
