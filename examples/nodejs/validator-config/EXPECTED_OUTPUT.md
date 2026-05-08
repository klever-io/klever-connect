# Expected output — validator-config

Running with `DRY_RUN=true` and only `COMMISSION=700` set:

```text
Operator: klv1qgz9c8r4r8a5g7l9z2tdc6yyy7y0jzn0wprv7h0utzqxvpmmqnwsezuq57
Network:  testnet
ValidatorConfig partial update:
{
  "blsPublicKey": "0a1b2c3d…",
  "commission": 700
}
DRY_RUN=true — not broadcasting. Set DRY_RUN=false to submit.
```

With `DRY_RUN=false`:

```text
Broadcast OK. Hash: f3a1c5e8…91b2
Explorer: https://kleverscan.org/transaction/f3a1c5e8…91b2
```
