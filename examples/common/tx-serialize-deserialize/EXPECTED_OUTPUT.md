# Expected output — `tx-serialize-deserialize`

```text
Serialized hex (213 bytes): 0a..............................<truncated>
Byte-exact round trip: true
Recovered nonce      : 42

To sign and broadcast this hex from a hardware signer:
  1. Send hex to the signer.
  2. Signer returns the signature bytes.
  3. recovered.addSignature(signatureBytes)
  4. provider.sendRawTransaction(recovered)
The full nodejs example is in nodejs/send-klv-transfer/.
```

Exact byte counts depend on chainId, nonce digits, and address length.
