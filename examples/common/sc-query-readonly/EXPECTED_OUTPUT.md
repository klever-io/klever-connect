# Expected output — `sc-query-readonly`

```text
Network         : testnet
Contract        : klv1qqq...counter
getValue() -> u64: 42
(typeof: bigint)
```

If the deployed counter has been incremented `N` times, expect `getValue` to
return `N`. The `typeof` may be `string`, `number`, or `bigint` depending on
the SDK version's u64 decoding strategy — all are equivalent under
`BigInt(value)`.
