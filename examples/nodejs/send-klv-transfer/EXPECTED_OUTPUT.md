# Expected output — send-klv-transfer

```text
Sender: klv1<your-address>
Recipient: klv1<recipient>
Amount: 1 KLV (1000000 smallest units)
Submitted: hash=<64-hex-chars> status=pending
Confirmed: status=success
```

If the provider's `result.wait` is unimplemented you'll instead see:

```text
Provider does not implement wait(); poll getTransaction(hash) instead.
```
