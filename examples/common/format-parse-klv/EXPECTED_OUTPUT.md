# Expected output — `format-parse-klv`

## `npm start`

```text
parseKLV / formatKLV (6-decimal precision)

                     1 KLV ->                  1000000 smallest units -> 1
                   1.5 KLV ->                  1500000 smallest units -> 1.5
             12.345678 KLV ->                 12345678 smallest units -> 12.345678
              0.000001 KLV ->                        1 smallest units -> 0.000001
            1000000000 KLV ->         1000000000000000 smallest units -> 1000000000
                     0 KLV ->                        0 smallest units -> 0

User-supplied amount:
             12.345678 KLV ->                 12345678 smallest units -> 12.345678

Why you should pass strings:
  parseKLV("0.30000000000000004") = 300000
  Always use bigint for math:
  1.5 + 2.7 = 4.2

Done.
```

(`User-supplied amount:` only prints when `KLV_AMOUNT` is set in `.env`.)
