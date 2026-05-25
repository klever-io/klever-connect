---
'@klever/connect-crypto': minor
---

# Add `prepareKlvMessage` for KLV browser wallet signature verification

Exports a new `prepareKlvMessage(message: string): Uint8Array` function that
implements the message preparation protocol used by the Klever browser extension
(`kos-rs KLV::prepare_message`) before Ed25519-signing:

```text
keccak256("\x17Klever Signed Message:\n" + byteLength + messageBytes)
```

Use the returned 32-byte hash as the `message` argument to `verifySignature`
when the signature was produced by `window.kleverWeb.signMessage` or
`BrowserWallet.signMessage` in extension mode.
