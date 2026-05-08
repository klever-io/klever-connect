# Expected output — `react-account-changed-listener`

## `npm run dev` — initial state (no extension)

`http://localhost:5173`:

- Heading: "Klever Connect: Account-Changed Listener"
- Red warning: "Klever Web Extension not detected — the listener is wired but cannot fire without the extension."
- Button: "Connect Klever Extension" (disabled effect, but click is no-op without extension)
- Address: `(not connected)`, Balance: `—`
- "No switches yet."

## `npm run dev` — extension installed, connected

After clicking Connect:

- The button now reads "Disconnect (klv1...)".
- Address shows the connected `klv1...`. Balance shows the current KLV.

When you switch account in the extension:

- A new entry appears at the top of the **accountChanged events** list:
  `2026-05-08T12:00:00.000Z: klv1prev → klv1next`
- The balance row updates (refetched on switch).

## `npm test`

```text
✓ src/__tests__/react-account-changed-listener.test.tsx (3 tests)
  ✓ shows the no-extension warning when the extension is missing
  ✓ captures accountChanged events and refetches the balance
  ✓ removes the listener on unmount (no leaks)

Test Files  1 passed (1)
Tests       3 passed (3)
```

## `npm run test:testnet`

```text
✓ src/__tests__/react-account-changed-listener.testnet.test.tsx (1 test)

Test Files  1 passed (1)
Tests       1 passed (1)
```
