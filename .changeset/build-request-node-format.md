---
'@klever/connect-transactions': minor
'@klever/connect-provider': minor
---

fix(transactions,provider): build() sends permission ID, data, amounts and scType the way the node reads them

`build()` posts the builder's request to the node's `/transaction/send`, and
several fields were sent in a form the node reads differently, so it silently
built a different transaction from the one the caller asked for:

- **Permission ID:** the node reads `permID`, so `permissionId` was dropped and
  the transaction was built with permission 0. `provider.buildTransaction()`
  now sends it as `permID` (the request type keeps `permissionId`), and
  `buildRequest()` checks it is a non-negative int32.
- **Data:** the node base64-decodes `data` for every transaction type, but it
  was encoded only for smart contracts, so a memo on a transfer arrived as
  different bytes. `buildRequest()` now base64-encodes data on every
  transaction. If you worked around this by passing base64 data to a
  non-smart-contract transaction, pass the plain string instead; it would now
  be encoded twice.
- **Amounts above 2^53:** a bigint amount that a JSON number can't hold exactly
  (such as `9007199254740993n`) was rounded by `Number()`, so the node built, and
  the caller signed, a different amount. `buildRequest()` now throws a
  `ValidationError` naming the field. A large amount a double holds exactly,
  such as `10n ** 17n`, is still sent as before.
- **Call values:** the node reads `callValue` as `map[string]int64` and refused
  a string amount such as `{ KLV: '1000000' }`. `smartContract()` now reads
  each amount like `transfer()` does (bigint, safe integer or decimal string,
  not negative) and sends it as a number.
- **String amounts on other contracts:** `createAsset()`, `vote()`, `withdraw()`,
  `createValidator()` and the contracts `addContract()` passes through sent a
  decimal-string amount (such as `maxSupply: '1000000000000'`) as a JSON
  string, which the node refuses. `buildRequest()` now sends every amount field
  of the contract request types as a number, and throws a `ValidationError` for
  a string amount that isn't a decimal integer.
- **scType 2 (upgrade):** the node defines only invoke (0) and deploy (1) and
  rejects 2 with "invalid smart contract type". `smartContract()` now throws
  for it, and `SmartContractRequest` no longer accepts `scType: 2`.
