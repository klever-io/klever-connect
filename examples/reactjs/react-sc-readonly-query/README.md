# `react-sc-readonly-query`

> Read-only smart-contract query from React. No wallet, no signing.

## Pattern

```ts
const contract = new Contract(address, abi, provider)
const result = await contract.call('get_value')
```

`Contract.call` uses `provider.queryContract()` internally — a stateless RPC that doesn't broadcast a tx. Free, fast, available without an extension.

## Run

```bash
npm install
npm run dev
npm test
npm run test:testnet
```

## Gotchas

- **Pass the provider, not the wallet.** Mistakenly passing a wallet still works (`Contract` falls back) but is wasteful.
- **`call` returns the decoded payload** in the form dictated by the ABI's `outputs` shape. For multi-return endpoints you get an array; for single-return you usually get the value directly.
- **Errors are SDK `ContractError`s** — wrap calls in `try/catch` and surface them via toast (see `react-error-handling-and-toasts`).
