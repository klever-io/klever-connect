# Expected output — `encoding-utilities`

## `npm start`

```text
Encoding utilities demo

  hexEncode([1,2,3,255,0,128]) = "010203ff0080"
  hexDecode("010203ff0080")          = [1,2,3,255,0,128]
  hexDecode("0x010203ff0080")        = [1,2,3,255,0,128]

  base58Encode = "..."           # 8-character base58 string
  base58Decode = [1,2,3,255,0,128]

  base64Encode = "AQID/wCA"
  base64Decode = [1,2,3,255,0,128]

  bech32Encode(zero 32 bytes) = "klv1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqpgm89z"
  bech32Decode(...) -> 32-byte buffer

  encodeHex("transfer") = "0x7472616e73666572"
  encodeHex("get_value") = "0x6765745f76616c7565"

  hashBlake2b("Hello, Klever!", 32 bytes) = <64-char hex>
  hashBlake2b("Hello, Klever!", 20 bytes) = <40-char hex>

Done.
```

The exact base58 and BLAKE2b values are deterministic but tedious to print in
this README; refer to the test snapshot for canonical bytes.
