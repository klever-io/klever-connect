# Expected output — tx-bulk-broadcast

```text
Sender:  klv1qgz9c8r4r8a5g7l9z2tdc6yyy7y0jzn0wprv7h0utzqxvpmmqnwsezuq57
Network: testnet
Recipients: 3
Base nonce: 100
[1/3] built nonce=100 -> klv1ALICE…
[2/3] built nonce=101 -> klv1BOB…
[3/3] built nonce=102 -> klv1CAROL…
DRY_RUN=true — built 3 signed txs but not broadcasting.
```

With `DRY_RUN=false`:

```text
[1/3] tx hash: 7a3b…0f1d
[2/3] tx hash: 8b4c…1e2f
[3/3] tx hash: 9c5d…2f30
```
