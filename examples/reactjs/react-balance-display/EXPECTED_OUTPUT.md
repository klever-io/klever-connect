# Expected output — `react-balance-display`

Once connected, the user sees one card per token:

```
Klever Connect — Balance Display

Connected as klv1abcd…xyz. Balances below auto-refresh every 10 seconds.

┌── KLV ──────────────────────────────────────────────┐
│ 250 KLV                                             │
│ Raw: 250000000 (precision 6)                        │
│ [ Refresh now ]                                     │
└─────────────────────────────────────────────────────┘

┌── KFI ──────────────────────────────────────────────┐
│ 12.5 KFI                                            │
│ Raw: 12500000 (precision 6)                         │
│ [ Refresh now ]                                     │
└─────────────────────────────────────────────────────┘
```

Set `VITE_KLV_KDA_ID=MTT-ABCD-1A` (or any KDA the user holds) to swap the
second card's token.

If no wallet is connected:

```
Connect a wallet to see live KLV and KFI balances.

[ Connect Wallet ]
```
