# Expected output — block-monitor

```text
Starting BlockMonitor on testnet (poll=4000ms)
[block] #1234567 hash=7a3b… at 2026-05-08T12:34:56.000Z
[block] #1234568 hash=8b4c… at 2026-05-08T12:35:00.000Z
[block] #1234569 hash=9c5d… at 2026-05-08T12:35:04.000Z
[block] #1234570 hash=adef… at 2026-05-08T12:35:08.000Z
[block] #1234571 hash=be01… at 2026-05-08T12:35:12.000Z
Observed 5 blocks — stopping.
Monitor stopped.
```

If a network stall happens you'll see:

```text
[slow-block] no new block for 30214ms since #1234571.
```
