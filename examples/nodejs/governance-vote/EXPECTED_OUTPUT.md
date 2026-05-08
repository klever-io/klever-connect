# Expected output — governance-vote

Voting YES on proposal 42, dry-run:

```text
Voter:      klv1qgz9c8r4r8a5g7l9z2tdc6yyy7y0jzn0wprv7h0utzqxvpmmqnwsezuq57
Network:    testnet
ProposalId: 42
Choice:     YES (type=0)
Amount:     <chain default — uses voter's available stake>
DRY_RUN=true — not broadcasting.
```

With `VOTE=no`:

```text
Choice:     NO (type=1)
```

With `DRY_RUN=false`:

```text
Vote tx hash: c4b1d7e8…91f2
Explorer:     https://kleverscan.org/transaction/c4b1d7e8…91f2
```
