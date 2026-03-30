# Monitoring Examples

Blockchain monitoring services using the Klever Connect SDK.

## Examples

| File               | Description                                                  |
| ------------------ | ------------------------------------------------------------ |
| `block-monitor.js` | Polls for new blocks and emits events; alerts on slow blocks |

## Usage

```bash
# Start block monitor (polls every 4 seconds by default)
node monitoring/block-monitor.js

# Custom poll interval
POLL_INTERVAL_MS=2000 node monitoring/block-monitor.js
```

## Architecture

`BlockMonitor` extends Node.js `EventEmitter` for a reactive pattern:

```js
monitor.on('block', ({ number, txCount }) => { ... })
monitor.on('slowBlock', ({ blockNumber, blockTimeSec }) => { ... })
monitor.on('error', (err) => { ... })
```

This makes it easy to plug in custom alert handlers (Slack, PagerDuty, email, etc.)
without modifying the monitor itself.

## Required Environment Variables

```env
NETWORK=testnet
POLL_INTERVAL_MS=4000   # optional
LOG_LEVEL=info          # optional
```
