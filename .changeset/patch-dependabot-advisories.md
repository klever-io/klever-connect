---
'@klever/connect-encoding': patch
---

chore(deps): bump protobufjs to 7.6.5 and regenerate proto output

Regenerated `compiled.js` picks up upstream generator hardening: `encodeDelimited`
now forks a non-empty writer, `verify`/`toObject` use `Object.hasOwnProperty.call`
instead of the shadowable `message.hasOwnProperty`, and `fromObject` validates that
its input is an object. Wire format and the `encode`/`decode` paths are unchanged.
