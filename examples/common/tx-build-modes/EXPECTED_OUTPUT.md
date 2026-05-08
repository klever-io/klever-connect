# Expected output — `tx-build-modes`

```text
Sender   : klv1qqqqqqqq...pgm89z
Receiver : klv1qqqqqqqq...pgm89z

--- Mode 1: build() (node-assisted) ---
  serialized hex (first 40 chars): 0a..............................
  proto length (bytes)           : 213

--- Mode 2: buildProto({...}) (offline) ---
  serialized hex (first 40 chars): 0a..............................
  hint: nonce/chainId/fees were supplied locally — no node round-trip beyond the nonce fetch above.

--- Mode 3: buildRequest() (raw JSON) ---
{
  "type": 0,
  "sender": "klv1qqqq...pgm89z",
  "data": [],
  "contract": [
    {
      "type": 0,
      "parameter": {
        "@type": "type.googleapis.com/proto.TransferContract",
        "toAddress": "klv1qqqq...pgm89z",
        "amount": "500000"
      }
    }
  ]
}

Done.
```

Exact byte counts depend on chainId, nonce digits, and address length.
