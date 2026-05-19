# Expected output — `sc-events-parse`

After running `nodejs/sc-invoke-mutable/` on the counter (which calls
`increment`), feed the resulting tx hash here:

```text
Network         : testnet
Contract        : klv1qqq...counter
Tx hash         : <hash>
Raw logs        : 1

Decoded events  : 1

  event[0] identifier=counter_changed
             args={"new_value":"1"}

Filtered (only counter_changed): 1

Done.
```

After `add(5)`, `new_value` is whatever the counter's previous value plus 5
was (counter contracts persist storage across calls).
