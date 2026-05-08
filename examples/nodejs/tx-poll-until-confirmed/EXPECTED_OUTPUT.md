# Expected output — tx-poll-until-confirmed

Successful confirmation:

```text
Network: testnet
Hash:    7a3b…0f1d
Timeout: 60000ms
Tx confirmed. status=success
```

Timeout (transaction never lands within `TIMEOUT_MS`):

```text
Network: testnet
Hash:    7a3b…0f1d
Timeout: 5000ms
waitForTransaction timed out — falling back to manual poll for one cycle...
Manual poll: transaction not found on chain (still pending or pruned).
```

Exit codes:
- `0` — confirmed
- `1` — failure status / network error
- `2` — timeout
