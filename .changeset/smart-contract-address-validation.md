---
'@klever/connect-core': patch
'@klever/connect-contracts': patch
'@klever/connect-transactions': patch
---

Validate smart contract addresses using the Klever VM address marker.

Smart contract builders and contract instances now reject regular Klever addresses for invoke and upgrade calls. The contracts package also re-exports `isValidContractAddress`.
