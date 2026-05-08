# Expected output — validator-create

Running with `DRY_RUN=true` (the default), the example does not broadcast.
You should see something close to the following on stdout (BLS key + tx hex
will differ for your inputs):

```text
Operator address: klv1qgz9c8r4r8a5g7l9z2tdc6yyy7y0jzn0wprv7h0utzqxvpmmqnwsezuq57
Network:          testnet
CreateValidator request prepared:
{
  "blsPublicKey": "0a1b2c3d…f7e8d9c0 (length=192)",
  "ownerAddress": "klv1qgz9c8r4r8a5g7l9z2tdc6yyy7y0jzn0wprv7h0utzqxvpmmqnwsezuq57",
  "rewardAddress": "klv1qgz9c8r4r8a5g7l9z2tdc6yyy7y0jzn0wprv7h0utzqxvpmmqnwsezuq57",
  "canDelegate": true,
  "commission": 500,
  "maxDelegationAmount": "1000000000",
  "name": "TestValidator"
}
Signed transaction hex (truncated): 0a8e010a200a1e6e3a92a0d8d4c0a05c4f9d2a4e3...
DRY_RUN=true — skipping broadcast. Set DRY_RUN=false to actually submit.
```

When `DRY_RUN=false` and the BLS key is genuinely eligible on the chosen
network, the last two lines are replaced with:

```text
Broadcast OK. Transaction hash: f3a1c5e8…91b2
Explorer: https://kleverscan.org/transaction/f3a1c5e8…91b2
```
