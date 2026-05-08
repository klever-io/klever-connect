# Automation Examples

Automated monitoring and utility scripts using the Klever Connect SDK.

## Examples

| File                     | Description                                                   |
| ------------------------ | ------------------------------------------------------------- |
| `balance-alert.js`       | Watches addresses and alerts when balance crosses a threshold |
| `transaction-watcher.js` | Polls until a transaction reaches a terminal status           |

## Usage

```bash
# Watch multiple addresses for low balance
WATCH_ADDRESSES=klv1...,klv1... node automation/balance-alert.js

# Custom threshold (alert if below 50 KLV)
LOW_THRESHOLD_KLV=50 WATCH_ADDRESSES=klv1... node automation/balance-alert.js

# Wait for a transaction to confirm (useful in scripts/CI)
TX_HASH=abc123... node automation/transaction-watcher.js

# With custom timeout
TX_HASH=abc123... TIMEOUT_MS=120000 node automation/transaction-watcher.js
```

## Using the watcher in scripts

`transaction-watcher.js` exits with code `0` on success and `1` on failure/timeout,
so it composes cleanly with shell scripts or CI pipelines:

```bash
# Broadcast a transaction, then wait for confirmation
TX_HASH=$(node basic/transfer.js | grep Hash | awk '{print $2}')
TX_HASH=$TX_HASH node automation/transaction-watcher.js && echo "Confirmed!"
```

## Required Environment Variables

```env
NETWORK=testnet

# balance-alert.js
WATCH_ADDRESSES=klv1...,klv1...
LOW_THRESHOLD_KLV=10
POLL_INTERVAL_MS=15000

# transaction-watcher.js
TX_HASH=your_transaction_hash
TIMEOUT_MS=60000
POLL_INTERVAL_MS=3000
```
