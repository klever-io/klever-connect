# Expected output — `tx-receipt-parse`

For a tx that froze 500 KLV:

```text
Network : testnet
Hash    : <hash>

Found 2 raw receipt(s). Decoding via parseReceipt():

  receipt[0] type=Transfer
             {"type":"Transfer","assetId":"KLV","from":"klv1abc...","to":"klv1xyz...","value":"500000000"}
  receipt[1] type=Freeze
             {"type":"Freeze","assetId":"KLV","bucketId":"a3f9c1...","value":"500000000"}

Done.
```

For an unknown / future receipt type, the SDK falls through gracefully and
returns the raw shape with a warning logged.
