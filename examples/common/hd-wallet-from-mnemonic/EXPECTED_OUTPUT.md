# Expected output — `hd-wallet-from-mnemonic`

## `npm start`

```text
Mnemonic source : generated
Mnemonic        : abandon ******** ... ******** about (12 words)
isValidMnemonic : true
Default path    : m/44'/690'/0'/0'/0'

Default account (m/44'/690'/0'/0'/0'):
  address    : klv1...
  publicKey  : <64-char hex>

Derived sibling accounts:
  m/44'/690'/0'/0'/0'      -> klv1...0
  m/44'/690'/0'/0'/1'      -> klv1...1
  m/44'/690'/0'/0'/2'      -> klv1...2

Done.
```

When `KLEVER_MNEMONIC` is set, the source line reads `$KLEVER_MNEMONIC` and the
derived addresses match what other Klever wallets show for the same phrase.
