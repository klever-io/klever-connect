# Expected output — `withdraw-after-cooldown`

```
Klever Connect — Withdraw

Connected as klv1abcd…xyz. Withdraw completes the unstaking cycle for
buckets whose cooldown has elapsed.

Withdraw type   [ 0 — Unstake (default) ▾ ]
KDA             [ KLV                    ]

[ Withdraw ]
```

After signing in the extension popup:

```
✓ Withdrawn! Hash: 0x...
```

If the cooldown has not elapsed yet, the SDK rejects:

```
✗ unfreeze cooldown not elapsed
```
