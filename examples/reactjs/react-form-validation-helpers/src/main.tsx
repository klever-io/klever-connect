// Vite + React 19 entry. We deliberately do NOT mount the KleverProvider here:
// this example showcases pure SDK helpers (`isValidAddress`, `parseKLV`) and
// never touches the network or wallet, so we keep the tree minimal.
import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './App'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
