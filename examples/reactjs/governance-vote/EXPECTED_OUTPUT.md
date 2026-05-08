# Expected output — `governance-vote`

```
Klever Connect — Governance Vote

Connected as klv1abcd…xyz. Vote on proposal 12. Voting power is committed
in KFI (6 decimals).

Proposal id           [ 12         ]
Voting power (KFI)    [ 100        ]

[ Vote YES ]   [ Vote NO ]
```

After signing in the extension popup:

```
✓ Vote submitted. Hash: 0x...
```

If the proposal is closed, the SDK rejects:

```
✗ proposal is not active
```
