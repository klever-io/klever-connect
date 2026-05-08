# Expected output — freeze-for-staking

```text
Sender: klv1<your-address>
Freezing 100 KLV (100000000 smallest units)
Submitted: hash=<64-hex-chars> status=pending
Confirmed: status=success
Look up the bucketId on the explorer or via provider.getTransactionReceipt(hash)
  -> https://kleverscan.org/transaction/<hash>
```

The bucket id printed on the explorer is what you'll feed into Flows 21
(unfreeze), 22 (delegate-to-validator), and 23 (undelegate).
