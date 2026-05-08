// =============================================================================
// main.tsx — Vite + React 19 entry point.
// =============================================================================
// This file does three things, in order:
//   1. Reads the desired network from `import.meta.env.VITE_KLV_NETWORK` so the
//      same code can target mainnet / testnet / devnet / local without rebuilding.
//   2. Wraps <App/> in <KleverProvider>, which:
//        - constructs a `KleverProvider` (HTTP) instance for that network,
//        - detects the Klever Web Extension (`window.kleverWeb`) with backoff,
//        - exposes everything to the tree via the `useKlever()` hook.
//   3. Wraps the whole thing in `<React.StrictMode>` so common mistakes (double
//      effects, legacy refs, etc.) surface during development.
//
// IMPORTANT: every example in this folder set imports from the umbrella package
// `@klever/connect`. Sub-package imports work too, but the umbrella keeps
// `package.json` short and matches what most copy-paste users would write.
// =============================================================================

import * as React from 'react'
import ReactDOM from 'react-dom/client'
import { KleverProvider } from '@klever/connect-react'

import { App } from './App'

// Vite injects `import.meta.env.*` at build time. Falls back to "testnet"
// because that is the safest default for examples — no real funds at risk.
const network = (import.meta.env.VITE_KLV_NETWORK ?? 'testnet') as
  | 'mainnet'
  | 'testnet'
  | 'devnet'
  | 'local'

// Locate the mount node we declared in `index.html`.
const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('#root not found in index.html')
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    {/*
      <KleverProvider> options:
        - `network`        : NetworkName | Network. Defaults to 'testnet'.
        - `autoConnect`    : if true, attempts wallet.connect() on mount.
        - `reconnectOnMount`: if true, restores the previous session from
                              localStorage on page reload.
        - `provider`       : pass a custom KleverProvider instance to override
                              network resolution entirely (e.g. for tests).
        - `debug`          : verbose logging.
      For this introductory example we set `autoConnect: false` so the user
      sees the "not connected" UX explicitly.
    */}
    <KleverProvider config={{ network, autoConnect: false }}>
      <App />
    </KleverProvider>
  </React.StrictMode>,
)
