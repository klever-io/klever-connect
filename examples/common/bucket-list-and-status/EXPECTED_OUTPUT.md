# Expected output — `bucket-list-and-status`

When KLEVER_ADDRESS has 500 KLV frozen / delegated:

```text
Network : testnet
Address : klv1abc...

KLV frozen   : 500
KLV unfrozen : 0  (in cooldown / withdrawable)

Buckets (1):
  bucket[0]
    id          : a3f9c1...
    balance     : 500 KLV
    status      : frozen
    delegation  : klv1validator...
    stakedAt    : epoch 100

Done.
```

When the same account has unstaked the bucket:

```text
  bucket[0]
    id          : a3f9c1...
    balance     : 500 KLV
    status      : unstaking (epoch=125)
    delegation  : klv1validator...
    stakedAt    : epoch 100
```
