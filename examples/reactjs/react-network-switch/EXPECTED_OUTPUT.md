# Expected output — `react-network-switch`

After `npm run dev` and visiting <http://localhost:5173>:

```
Klever Connect — Network Switch

Switching networks does not disconnect the wallet. The BrowserWallet keeps
the same address but signs against the new chain. The HTTP provider, network
selection in localStorage, and any subsequent reads all flip atomically.

Current network: testnet

Switch to: [ testnet ▾ ]
            ├ mainnet
            ├ testnet
            ├ devnet
            └ local

Latest block on testnet: 12 345 678
```

Pick `mainnet` from the dropdown and the badge updates to `mainnet`, and the
"Latest block" line refreshes with mainnet's height.

If you pick `local` without running a Klever node locally, you'll see:

```
RPC error: fetch failed
```

Switch back to `testnet` to recover.
