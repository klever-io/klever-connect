# Expected output — `send-klv-transfer`

Connected user view (`localhost:5173`):

```
Klever Connect — Send KLV

Connected as klv1abcd…xyz.

┌──────────────────────────────────────────┐
│ Recipient (klv1…) [ ____________ ]       │
│ Amount (KLV)      [ 1            ]       │
│                                          │
│ [ Send 1 KLV ]                           │
└──────────────────────────────────────────┘
```

After clicking **Send 1 KLV** and approving in the extension popup:

```
✓ Submitted! Hash: a1b2c3...
```

If the recipient field doesn't parse as `klv1…` bech32:

```
Not a valid Klever address.
```

If the wallet rejects (cancelled in extension, insufficient balance, …):

```
✗ insufficient balance
```
