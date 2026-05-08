// Bootstraps the example with the real KleverProvider so children can use
// useKlever(). The provider auto-detects the Klever Web Extension and wires
// the `accountChanged` event source we're going to listen for.
import React from 'react'
import ReactDOM from 'react-dom/client'
import { KleverProvider } from '@klever/connect'
import { App } from './App'

const network = (import.meta.env.VITE_NETWORK ?? 'testnet') as 'testnet' | 'mainnet' | 'devnet'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <KleverProvider config={{ network, autoConnect: false, reconnectOnMount: true, debug: true }}>
      <App />
    </KleverProvider>
  </React.StrictMode>
)
