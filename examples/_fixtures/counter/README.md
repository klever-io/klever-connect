# Counter — smart-contract fixture

A minimal Rust + `klever-sc` smart contract that the `sc-*` examples in this
library deploy, query, and parse events for. Authored on purpose to be the
**simplest contract that exercises every part of the SDK's contract pipeline**:

- Deploy with constructor (`init`)
- Mutable endpoint with no args (`increment`)
- Mutable endpoint with a typed arg (`add(u64)`)
- View endpoint that returns a typed result (`get_value -> u64`)
- Indexed event (`counter_changed`)

This fixture replaces / supplements the bundled `dice` fixture in
`packages/connect-contracts/examples/dice/`. The dice contract ships with the
SDK proper; the counter ships here, alongside the examples that consume it,
because Phase-2 settled on a SC fixture that lives in the examples library.

## Public surface

| Endpoint          | Kind        | Args                       | Returns | Description                              |
| ----------------- | ----------- | -------------------------- | ------- | ---------------------------------------- |
| `init`            | constructor | none                       | -       | Sets the counter to 0.                   |
| `increment`       | endpoint    | none                       | -       | Adds 1.                                  |
| `add`             | endpoint    | `value: u64`               | -       | Adds `value`.                            |
| `get_value`       | view        | none                       | `u64`   | Returns the current counter (read-only). |
| `counter_changed` | event       | `new_value: u64` (indexed) | -       | Emitted on every state change.           |

## Files

| Path               | Description                                                                         |
| ------------------ | ----------------------------------------------------------------------------------- |
| `Cargo.toml`       | Minimal manifest — `crate-type = ["cdylib"]`, depends on `klever-sc 0.45.0`.        |
| `src/lib.rs`       | The contract source itself, heavily commented for pedagogy.                         |
| `scripts/build.sh` | One-shot build script — produces `output/counter.wasm` + `output/counter.abi.json`. |
| `output/`          | Build outputs. **Not committed** until you run `./scripts/build.sh`.                |

## Building

```bash
# One-time setup (per machine)
rustup target add wasm32-unknown-unknown
cargo install --locked klever-sc-meta

# Build the contract
cd examples/_fixtures/counter
./scripts/build.sh

# Outputs land in:
#   output/counter.wasm
#   output/counter.abi.json
```

Once built, the SC examples can read these artifacts directly.

> **Heads up.** The sandbox that authored this fixture **did not run a
> compile**. Source + build script are committed; the produced `.wasm` and
> `.abi.json` are NOT in the repo. The first user (or CI) to run the build
> script populates `output/`.

## Why a custom contract?

- The `dice` contract has structs, enums, and randomness — pedagogical noise
  for someone learning to call a contract for the first time.
- A counter has exactly one storage slot, two write paths, and one read path —
  small enough that the ABI JSON is a single screen and the event topic /
  data layout is obvious.
- It gives the `sc-events-parse` flow a deterministic event to decode without
  having to fund a real game.

## Used by

These examples consume `output/counter.wasm` and / or
`output/counter.abi.json`:

- `examples/common/sc-query-readonly` — calls `get_value`.
- `examples/common/sc-events-parse` — decodes `counter_changed` from a tx log.
- `examples/common/sc-abi-load-and-validate` — loads the ABI JSON and lists endpoints.
- `examples/nodejs/sc-deploy` — deploys the WASM.
- `examples/nodejs/sc-invoke-mutable` — sends `increment` / `add(value)` txs.
- `examples/nodejs/sc-deploy-and-interact-end-to-end` — deploy + interact in one script.
- `examples/reactjs/react-sc-readonly-query` — view call from a component.
- `examples/reactjs/react-sc-invoke-with-extension` — mutable invoke through the extension.

## Verifying ABI shape

After building, your `output/counter.abi.json` should resemble:

```json
{
  "buildInfo": {
    "rustc": { "version": "1.x.x", ... },
    "contractCrate": { "name": "counter", "version": "0.0.1" },
    "framework": { "name": "klever-sc", "version": "0.45.0" }
  },
  "name": "Counter",
  "constructor": { "inputs": [], "outputs": [] },
  "endpoints": [
    { "name": "increment", "mutability": "mutable", "inputs": [], "outputs": [] },
    { "name": "add", "mutability": "mutable",
      "inputs": [{ "name": "value", "type": "u64" }],
      "outputs": [] },
    { "name": "get_value", "mutability": "readonly",
      "inputs": [],
      "outputs": [{ "type": "u64" }] }
  ],
  "events": [
    { "identifier": "counter_changed",
      "inputs": [{ "name": "new_value", "type": "u64", "indexed": true }] }
  ],
  "types": {}
}
```

If the field shapes drift (klever-sc rev change), adjust the example test
assertions accordingly.
