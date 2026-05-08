// =============================================================================
// main.tsx - Vite + React 19 entry point.
// =============================================================================
// Wraps <App/> in <KleverProvider> so the whole tree can call useKlever() and
// the other Klever hooks. Network is configurable via VITE_KLV_NETWORK.
//
// IMPORTANT: BrowserWallet (used by <KleverProvider>) talks to the Klever Web
// Extension. In production this is what your users will install. In tests we
// substitute a MockWallet via vi.mock - see src/__tests__/*.test.tsx.
// =============================================================================

import * as React from 'react'
import ReactDOM from 'react-dom/client'
import { KleverProvider } from '@klever/connect-react'

import { App } from './App'

const network = (import.meta.env.VITE_KLV_NETWORK ?? 'testnet') as
  | 'mainnet'
  | 'testnet'
  | 'devnet'
  | 'local'

const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('#root not found in index.html')
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    {/*
      autoConnect: false - users see an explicit Connect button (or the
      example calls connect() programmatically). Set to true if you want
      the provider to attempt connection on mount.
    */}
    <KleverProvider config={{ network, autoConnect: false }}>
      <App />
    </KleverProvider>
  </React.StrictMode>,
)