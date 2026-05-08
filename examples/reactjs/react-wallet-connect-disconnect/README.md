# `react-wallet-connect-disconnect`

Connect / disconnect a Klever wallet via the Klever Web Extension.

## What this shows

- `useKlever().connect()` to start the extension authorisation flow.
- `useKlever().disconnect()` to clear session state.
- `extensionInstalled` and `searchingExtension` flags to drive the UI.
- Surfacing connect errors via `useKlever().error`.

## Prereqs

- Node 20+, npm.
- The [Klever Web Extension](https://klever.io/extension) installed in your
  browser. The example renders an install banner if you skip this step.

## Run it

```bash
cd examples/reactjs/react-wallet-connect-disconnect
npm install
npm run dev
```

Open <http://localhost:5173>, click **Connect Wallet**, approve in the
extension popup, then click **Disconnect** to log out.

## Run the tests

```bash
npm test                  # mocked (no extension, no network)
npm run test:testnet      # live testnet smoke test (excluded from CI)
```

## Gotchas

- If the user closes the extension popup mid-prompt, `connect()` rejects with
  a `WalletError`; we surface it via `useKlever().error`.
- The provider persists `connected: true` in `localStorage` after a successful
  connect; setting `reconnectOnMount: true` in `<KleverProvider config>` will
  re-establish the session on the next page load.
- Disconnect does NOT revoke permissions in the extension itself — users must
  remove this site from the extension's allowed list to truly forget it.
