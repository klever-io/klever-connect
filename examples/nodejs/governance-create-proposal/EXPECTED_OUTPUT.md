# Expected output — governance-create-proposal

```text
Proposer: klv1qgz9c8r4r8a5g7l9z2tdc6yyy7y0jzn0wprv7h0utzqxvpmmqnwsezuq57
Network:  testnet
Proposal request:
{
  "parameters": {
    "22": "5000"
  },
  "description": "Lower minimum-stake parameter to 5000 KLV",
  "epochsDuration": 10
}
DRY_RUN=true — not broadcasting.
```

With `DRY_RUN=false`:

```text
Proposal tx hash: a3b1c7d8…91f2
Explorer: https://kleverscan.org/transaction/a3b1c7d8…91f2
Look up the receipt to find the assigned proposalId, then use flow 38 to vote.
```
