# Expected output — keystore-encrypt-decrypt

Running the example with a fresh `KEYSTORE_PASSWORD=demo-password` yields output of
the form below. The bech32 address is random per run; everything else is stable.

```text
Step 1 — generated wallet address: klv1qx2y4ahjsxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
Step 2 — encrypting (scryptN=4096 for demo speed)...
  - keystore version: 3
  - cipher:           aes-128-ctr
  - kdf:              scrypt
  - address (clear):  klv1qx2y4ahjsxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
Step 3 — keystore saved to: /abs/path/to/wallet.keystore.json
Step 4 — decrypting keystore from disk...
  - restored address: klv1qx2y4ahjsxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
Step 5 — round-trip verified: original and restored addresses match.
Done. Keystore round-trip succeeded.
```

The file produced at `KEYSTORE_PATH` is a Web3 Secret Storage v3 JSON, e.g.:

```json
{
  "version": 3,
  "id": "<uuid>",
  "address": "klv1...",
  "crypto": {
    "cipher": "aes-128-ctr",
    "ciphertext": "<hex>",
    "cipherparams": { "iv": "<hex>" },
    "kdf": "scrypt",
    "kdfparams": { "dklen": 32, "n": 4096, "p": 1, "r": 8, "salt": "<hex>" },
    "mac": "<hex>"
  }
}
```
