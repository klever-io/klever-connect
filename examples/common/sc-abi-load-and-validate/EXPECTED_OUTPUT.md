# Expected output — `sc-abi-load-and-validate`

```text
Loaded ABI: Counter (v0.0.1)

Validation: OK

Endpoints (3):
  mutable  increment()
  mutable  add(value: u64)
  readonly getValue() -> u64

Events (1):
  counter_changed(new_value: u64 (indexed))

Encoded add(5) -> <Uint8Array (8 bytes)>     # exact representation depends on SDK version

Done.
```

If the ABI is invalid (e.g. someone trims a required field), `Validation`
prints `FAIL` followed by a list of error messages and the script exits with
code 1.
