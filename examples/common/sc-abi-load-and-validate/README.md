# `sc-abi-load-and-validate` — Flow #62

Load a smart-contract ABI JSON, validate its shape, and enumerate the
endpoints / events.

## Umbrella import gap

`ABIValidator` and `Interface` are not (yet) re-exported by the umbrella
`@klever/connect`. This example imports them from
`@klever/connect-contracts` directly.

## What you learn

- ABI shapes for klever-sc contracts: `name`, `constructor`, `endpoints[]`,
  `events[]`, `types`, plus a `buildInfo` block.
- `ABIValidator.validate(json)` -> `{ valid, errors }` — fail loud before you
  use a malformed ABI.
- `new Interface(abi)` — low-level access; for high-level calls prefer
  `Contract` (see `../sc-query-readonly/`).
- Walk endpoints by `mutability`: `readonly` for queries, `mutable` for txs.

## Run

```bash
npm install
npm start
```

## Tests

```bash
npm test              # validates the ABI + a deliberately broken ABI fails
npm run test:testnet  # placeholder — pure ABI logic, no network
```

## Bundled ABI

`src/counter-abi.json` mirrors what `klever-sc-meta build` produces for the
in-repo `_fixtures/counter/` Rust contract. After running the build script in
the fixture folder, swap this file for the produced `output/counter.abi.json`
to keep them in lockstep.

## Loading from disk (Node-only)

The SDK also ships `loadABI(filePath)` — but it uses `fs` and is therefore
Node-only. Use it from `nodejs/` examples; in `common/` we pass the ABI via
import attributes (`with { type: 'json' }`), which works in any modern
runtime.
