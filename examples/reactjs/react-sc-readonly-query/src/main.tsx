// Vite + React 19 entry. Even though this example only does READ-ONLY
// contract calls (no signing required), we still wrap with KleverProvider
// because we need the configured `provider` instance — useKlever().provider
// is how the Contract reads from the chain.
import React from 'react'
import ReactDOM from 'react-dom/client'
import { KleverProvider } from '@klever/connect'
import { App } from './App'

const network = (import.meta.env.VITE_NETWORK ?? 'testnet') as 'testnet' | 'mainnet' | 'devnet'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <KleverProvider config={{ network, autoConnect: false }}>
      <App />
    </KleverProvider>
  </React.StrictMode>
)
