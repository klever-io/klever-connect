# Expected output — `balance-read`

## `npm start`

```text
Network : testnet
Address : klv1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqpgm89z

KLV balance (raw)    : 0
KLV balance (human)  : 0

(KDA_ID not set — skipping KDA balance fetch)
```

When the address has KLV and `KDA_ID=MTT-ABCD-1A`:

```text
Network : testnet
Address : klv1...

KLV balance (raw)    : 12345678
KLV balance (human)  : 12.345678

MTT-ABCD-1A balance (raw)  : 100
MTT-ABCD-1A balance (human): not formatted automatically — fetch the asset's precision via getAccount() and use formatUnits().
```
