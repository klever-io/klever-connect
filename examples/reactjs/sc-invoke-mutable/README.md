# `sc-invoke-mutable` (React)

> Form-driven mutable smart-contract invoke from React.

## What it shows

Wraps a deployed counter contract in a `Contract` instance and calls its mutable methods (`increment()`, `add(u32)`) through the connected wallet. The wallet routes signing through the Klever Web Extension when present.

## Counter fixture

The Rust source lives in `examples/_fixtures/counter/`. To rebuild:

```bash
cd examples/_fixtures/counter
cargo build --release --target wasm32-unknown-unknown
# Output: output/counter.wasm + output/counter.abi.json
```

Then deploy via the `sc-deploy` Node example (writes a `klv1qqqqqqqqqqq...` contract address). Set `VITE_COUNTER_ADDRESS` in `.env.local` (gitignored).

## Run

```bash
npm install
npm run dev
npm test
npm run test:testnet
```

## Gotchas

- **Use `isValidContractAddress`** (not `isValidAddress`) when you want to reject EOAs.
- **`Contract.invoke` returns whatever the wallet returns** — the shape varies between extension and node wallets. Always read `.hash` defensively.
- **Mocks vs real ABI:** the test mocks `Contract` so the inline ABI snippet is enough. In production, load the full `counter.abi.json` for type-checking.
