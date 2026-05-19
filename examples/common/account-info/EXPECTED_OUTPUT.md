# Expected output — `account-info`

```text
Network : testnet
Address : klv1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqpgm89z
Nonce   : 0
KLV bal : 0

(no asset balances)

Permissions: 0 entry(ies)

Done.
```

A real funded testnet account with frozen KLV looks like:

```text
Network : testnet
Address : klv1abc...
Nonce   : 42
KLV bal : 1234.5

Assets:
  KLV                balance=         1234.500000 (precision 6)
                       frozen=         500.000000
  MTT-ABCD-1A        balance=                100 (precision 0)

Permissions: 0 entry(ies)

Done.
```
