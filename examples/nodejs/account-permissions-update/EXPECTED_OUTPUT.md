# Expected output — account-permissions-update

```text
Account:  klv1qgz9c8r4r8a5g7l9z2tdc6yyy7y0jzn0wprv7h0utzqxvpmmqnwsezuq57
Network:  testnet
UpdateAccountPermission request:
{
  "permissions": [
    {
      "type": 0,
      "permissionName": "owner",
      "threshold": 2,
      "operations": "0x000000",
      "signers": [
        {"address": "klv1ALICE…", "weight": 1},
        {"address": "klv1BOB…",   "weight": 1}
      ]
    }
  ]
}
Built and signed. Tx hex (truncated): 0a8e010a200a1e6e3a92a0…
BROADCAST_SINGLE_SIGNED=false — stopping here. Use the printed signed tx hex with your multi-sig signer aggregator before broadcasting.
```
