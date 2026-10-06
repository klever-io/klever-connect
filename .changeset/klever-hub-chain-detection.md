---
'@klever/connect-wallet': patch
---

fix(wallet): stop treating a numeric KLV chain code as a chain switch. The extension renumbered its chains (KLV 1 → 38, and 1 is now TRX), so `BrowserWallet` disconnected itself right after connecting. Numeric codes are now decided by the account address. Also exports the `KleverHubAccountEvent` type used by `KleverHub.onAccountChanged`.
