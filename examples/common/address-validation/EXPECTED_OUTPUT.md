# Expected output — `address-validation`

## `npm start`

```text
Address validation demo:

  1. Known-good wallet
    raw         : klv1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqpgm89z
    regex check : true
    bech32 check: true
    branded     : klv1qqqqqqqq...pgm89z

  2. Obvious garbage   
    raw         : not-an-address
    regex check : false
    bech32 check: false
    branded     : (skipped — fails strict bech32 check)

  3. Bad checksum      
    raw         : klv1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqaaaaaa
    regex check : true
    bech32 check: false
    branded     : (skipped — fails strict bech32 check)

  4. Sample contract   
    raw         : klv1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqpgm89z
    regex check : true
    bech32 check: true
    branded     : klv1qqqqqqqq...pgm89z

Set KLEVER_ADDRESS in .env to validate your own address.

safeBrand(KNOWN_GOOD):     { ok: true, address: 'klv1qqqq...pgm89z' }
safeBrand(BAD_CHECKSUM):   { ok: false, reason: 'fails bech32 checksum' }
safeBrand(GARBAGE):        { ok: false, reason: 'fails regex' }

Done.
```

When `KLEVER_ADDRESS=klv1...your-address` is set, an extra block "5. KLEVER_ADDRESS env"
is printed.
