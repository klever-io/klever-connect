# `send-klv-transfer` (React)

The hello-world transfer for Klever React dApps. A form, an extension prompt,
a submitted-toast.

## What this shows

- `useTransaction()` hook with `sendKLV(to, amount)`.
- Real-time validation via `isKleverAddress(to)`.
- Amount conversion via `parseKLV('1') === 1_000_000n`.

## Prereqs

- Klever Web Extension installed and unlocked.
- Some testnet KLV in the connected address. Use the testnet faucet at
  <https://faucet.testnet.klever.finance> if needed.

## Run it

```bash
cd examples/reactjs/send-klv-transfer
npm install
npm run dev
```

## Tests

```bash
npm test
npm run test:testnet
```

## Gotchas

- Always `parseKLV` (or `parseUnits`) before passing to `sendKLV` —
  the hook never auto-converts.
- The extension popup may take a moment to surface; `isLoading` toggles for
  the duration so the button shows "Sending…".
- If the user rejects the popup, the SDK throws and the error renders below
  the form.
