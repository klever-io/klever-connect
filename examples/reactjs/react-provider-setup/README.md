# `react-provider-setup`

The hello-world of Klever React apps: wrap your tree in `<KleverProvider>` and
read live state with `useKlever()`.

## What this shows

- How to scaffold a Vite + React 19 app that uses `@klever/connect`.
- How `<KleverProvider>` exposes provider/network/wallet state through context.
- How `useKlever()` returns reactive values (`currentNetwork`,
  `extensionInstalled`, `searchingExtension`, `isConnected`, `address`).

## Prereqs

- **Node 20+**, **npm** (or pnpm — works inside the monorepo workspace too).
- Optional: the [Klever Web Extension](https://klever.io/extension) installed
  in your browser. The example renders cleanly without it; it just shows
  "Extension not installed".

## Run it

```bash
cd examples/reactjs/react-provider-setup
npm install
cp .env.example .env.local   # edit if you want a different network
npm run dev
```

Open <http://localhost:5173> and watch the "Live state" card.

## Run the tests

```bash
npm test                 # mocked, CI-safe (no network, no extension)
npm run test:testnet     # live testnet smoke test (NOT run in CI)
```

## How it works

`src/main.tsx` mounts a `<KleverProvider>` with `network: 'testnet'` and
`autoConnect: false`. `src/App.tsx` calls `useKlever()` to read the live
state and renders three rows.

The provider does the heavy lifting in the background:

1. Constructs an HTTP `KleverProvider` for the chosen network.
2. Polls `window.kleverWeb` with exponential backoff to detect the Klever Web
   Extension. While polling, `searchingExtension` is `true`.
3. Restores any previous wallet connection from `localStorage` if
   `reconnectOnMount: true` is set (we leave it `false` here).

## Gotchas

- All Vite env vars must be prefixed `VITE_` to be exposed to the browser.
- If you set `network: 'local'`, the provider tries `http://localhost:8080` —
  start a local Klever node first or the network call will fail.
- We pass `autoConnect: false` so the example never prompts the extension.
  Set it to `true` (or call `connect()` from a button) to wire up real signing.

## File map

```
react-provider-setup/
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── .env.example
├── index.html
├── src/
│   ├── main.tsx           # KleverProvider entry
│   ├── App.tsx            # useKlever() consumer
│   └── __tests__/
│       ├── setup.ts
│       ├── react-provider-setup.test.tsx
│       └── react-provider-setup.testnet.test.tsx
├── EXPECTED_OUTPUT.md
└── README.md
```
