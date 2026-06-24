#!/usr/bin/env bash
#
# Build the counter contract to WASM + ABI.
#
# Output:
#   examples/_fixtures/counter/output/counter.wasm
#   examples/_fixtures/counter/output/counter.abi.json
#
# Prerequisites:
#   - Rust toolchain (rustup, stable channel)
#   - wasm32 target:        rustup target add wasm32-unknown-unknown
#   - klever-sc CLI:        cargo install --locked klever-sc-meta
#     (analogous to MultiversX's `mxpy contract build` — it generates the ABI from
#      the Rust source, then runs `cargo build --release --target wasm32-unknown-unknown`
#      and copies / shrinks the produced .wasm into the `output/` folder.)
#
# Usage:
#   cd examples/_fixtures/counter
#   ./scripts/build.sh
#
# After this runs, every example that needs the counter contract reads from
# `examples/_fixtures/counter/output/`.
#
# TODO(KLC-2322): verify the exact `klever-sc-meta` invocation against the
# klever-sc docs. The dice fixture (packages/connect-contracts/examples/dice/)
# ships pre-compiled artifacts only, with no build script committed to the repo.

set -euo pipefail

# Resolve the script's directory so we can run from anywhere.
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
CONTRACT_DIR="$( cd "$SCRIPT_DIR/.." && pwd )"

cd "$CONTRACT_DIR"

echo ">> Building counter contract in $CONTRACT_DIR"

# Preferred path: klever-sc-meta handles ABI generation + WASM build + bytecode
# shrink in one go. This is the same flow MultiversX docs recommend for sc-meta.
if command -v klever-sc-meta >/dev/null 2>&1; then
  echo ">> Using klever-sc-meta"
  klever-sc-meta all build
else
  echo ">> klever-sc-meta not found; falling back to a raw cargo build"
  echo ">> NOTE: this path will produce only the .wasm — the ABI JSON will be missing."
  echo ">>       Install klever-sc-meta to generate the ABI: cargo install --locked klever-sc-meta"

  rustup target add wasm32-unknown-unknown >/dev/null 2>&1 || true

  cargo build \
    --release \
    --target wasm32-unknown-unknown \
    --target-dir target

  mkdir -p output
  rm -f output/counter.abi.json
  cp target/wasm32-unknown-unknown/release/counter.wasm output/counter.wasm
fi

echo ">> Build complete."
echo ">> Artifacts:"
ls -la "$CONTRACT_DIR/output/" || echo "(output/ not yet populated — check the build log above)"
