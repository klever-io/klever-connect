# Expected output — `react-form-validation-helpers`

## Running `npm run dev`

Vite serves the app at `http://localhost:5173`. The page shows:

1. Heading: "Klever Connect: Form Validation Helpers"
2. A short description paragraph.
3. A form with two inputs:
   - **Recipient address** — placeholder `klv1...`
   - **Amount (KLV)** — placeholder `1.5`
4. A submit button labelled `Fill the form to enable` (disabled).
5. A reference list naming `isValidAddress(addr)` and `parseKLV(value)`.

### Interaction expectations

| Action | UI change |
|---|---|
| Type `klv1nonsense` into address | Red border, error: "Not a valid klv1... address (bech32 checksum failed)" |
| Type a valid `klv1...` address | Green check: "✓ Valid Klever address" |
| Type `abc` into amount | Red border, error: "Invalid number" (or similar) |
| Type `0` into amount | Error: "Amount must be greater than zero" |
| Type `1.5` into amount | Green check: "✓ 1500000 smallest-units" |
| Both fields valid | Submit button becomes enabled, label changes to "Submit (would call sendKLV)" |
| Click submit | A "Last valid submission" pre-block appears with JSON `{ "to": "klv1...", "amountKLV": "1.5" }` |

## Running `npm test`

```text
✓ src/__tests__/react-form-validation-helpers.test.tsx (3 tests)
  ✓ renders the form and disables submit until both fields validate
  ✓ publishes a snapshot on valid submit
  ✓ rejects zero and negative amounts

Test Files  1 passed (1)
Tests       3 passed (3)
```

## Running `npm run test:testnet`

```text
✓ src/__tests__/react-form-validation-helpers.testnet.test.tsx (1 test)

Test Files  1 passed (1)
Tests       1 passed (1)
```

(This example never hits the network, so the testnet variant runs purely
locally and finishes in milliseconds. Other examples take longer.)
