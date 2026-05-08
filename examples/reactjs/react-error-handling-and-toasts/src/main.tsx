// Vite + React 19 entry. Wraps the app in KleverProvider so children can
// call `useKlever`, `useTransaction`, etc. The provider also detects the
// Klever Web Extension and exposes its lifecycle (search/install/connect).
import React from 'react'
import ReactDOM from 'react-dom/client'
import { KleverProvider } from '@klever/connect'
import { App } from './App'

const network = (import.meta.env.VITE_NETWORK ?? 'testnet') as 'testnet' | 'mainnet' | 'devnet'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <KleverProvider config={{ network, autoConnect: false, reconnectOnMount: true }}>
      <App />
    </KleverProvider>
  </React.StrictMode>
)
