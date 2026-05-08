# Expected output — `freeze-for-staking`

```
Klever Connect — Freeze (stake)

Connected as klv1abcd…xyz. Freezing KLV creates a bucket you can later
delegate to a validator. Freezing other KDAs accumulates a frozen balance.

KDA               [ KLV          ]
Amount            [ 100          ]

[ Freeze 100 KLV ]
```

After signing in the extension popup and the receipt is fetched:

```
✓ Submitted! Hash: a1b2c3...
Bucket id: 0x8f9e... (32-byte hash)
```

For non-KLV freezes the bucket id row is omitted (no buckets exist).
