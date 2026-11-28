---
'@klever/connect-encoding': patch
'@klever/connect-provider': patch
---

fix(encoding,provider): sendRawTransaction rejects hex and bytes it can't broadcast byte-for-byte

The provider decodes a hex or bytes transaction with this SDK's proto and sends
the node its JSON, and the node checks the signature against the RawData it
rebuilds from that JSON. A RawData field this SDK's proto doesn't know, such as
one written by a tool with a newer proto, was dropped on decode, so the node
hashed different bytes than were signed and refused the transaction with a
signature error that didn't say why.

`transactionBytesToJSON()`, and so `sendRawTransaction()` and
`broadcastTransaction()`, now re-encode the decoded RawData and compare it with
the signed bytes. When they differ, they throw before broadcasting: "Encoded
transaction contains RawData fields this SDK does not know, so the node would
not receive what was signed; update @klever/connect-encoding". Fields outside
RawData aren't signed and are still accepted. Every transaction the node builds
re-encodes unchanged, checked against 22 node-built transactions across the
contract types in use.
