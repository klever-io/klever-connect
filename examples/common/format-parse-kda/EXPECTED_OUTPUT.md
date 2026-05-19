# Expected output — `format-parse-kda`

## `npm start`

```text
parseUnits / formatUnits — arbitrary-precision KDA conversion

           KLV (p=6):                     12.345678 ->                     12345678 -> 12.345678  (branded: 12.345678)
   USDT-stable (p=8):                1000.50000000 ->                 100050000000 -> 1000.5  (branded: 1000.5)
        NFT-id (p=0):                            1 ->                            1 -> 1  (branded: 1)
     high-prec (p=18):       0.000000000000000001 ->                           1 -> 0.000000000000000001  (branded: 0.000000000000000001)

User-supplied:
          user (p=8):                       1000.5 ->                 100050000000 -> 1000.5  (branded: 1000.5)

Cross-precision pitfall:
  parseUnits('1', 6) = 1000000
  parseUnits('1', 8) = 100000000
  Adding them yields a meaningless number: 101000000
  Always compare/add bigints of the SAME precision.

Done.
```

(`User-supplied:` only appears when `KDA_AMOUNT` and `KDA_PRECISION` are set.)
