# Expected output — `key-pair-generate-and-import`

## `npm start`

```text
Key-pair generate / import demo

1. Generated:
     privateKey (hex): a1b2...c3d4 (length=64)
     publicKey  (hex): 5f9e3a...   # full 64-char hex

2. Set PRIVATE_KEY in .env to demonstrate importPrivateKey().

3. Derived public key matches generation: true

4. Signature (hex, 64 bytes): 7c2d8b9a4f1e6c3a...

Done.
```

When `PRIVATE_KEY` is set:

```text
2. Imported from PRIVATE_KEY env:
     privateKey (hex): abcd...ef01 (length=64)
     publicKey  (hex): <derived public key>
```

The redaction `<first 4>...<last 4>` is intentional — never log full private
keys in production.
