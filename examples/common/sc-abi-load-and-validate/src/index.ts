/**
 * Flow #62 — sc-abi-load-and-validate
 *
 * Smart-contract ABIs in Klever follow the klever-sc spec (very close to
 * MultiversX's mxsc ABI shape). The SDK exposes:
 *
 *   - `ABIValidator.validate(json)`  -> { valid, errors }
 *   - `Interface(abi)`               low-level ABI parser, lists endpoints / events
 *
 * `loadABI(filePath)` is a Node-only helper (uses fs). For `common/` we pass
 * the JSON directly via `import` — works in any runtime that supports
 * `import attributes` (Node 22+, Vite, Webpack 5+).
 *
 * The bundled `counter-abi.json` matches the shape produced by
 * `klever-sc-meta build` for the in-repo `_fixtures/counter/` Rust contract.
 */

import counterAbi from './counter-abi.json' with { type: 'json' }

// TODO(KLC-2322): umbrella does not yet re-export ABIValidator / Interface;
// import directly from the contracts package as a documented exception.
import { ABIValidator, Interface } from '@klever/connect-contracts'

async function main(): Promise<void> {
  console.log(`Loaded ABI: ${counterAbi.name} (v${counterAbi.buildInfo.contractCrate.version})\n`)

  // ---------------------------------------------------------------------------
  // 1. Validate the ABI shape.
  //    `ABIValidator.validate` walks the JSON, checks required fields,
  //    type references, and returns a flat list of errors.
  // ---------------------------------------------------------------------------
  const validation = ABIValidator.validate(counterAbi)
  console.log(`Validation: ${validation.valid ? 'OK' : 'FAIL'}`)
  if (!validation.valid) {
    for (const err of validation.errors ?? []) {
      console.log(`  - ${err}`)
    }
    throw new Error('Refusing to continue with an invalid ABI.')
  }

  // ---------------------------------------------------------------------------
  // 2. Parse and inspect with `Interface`.
  //    Use `Interface` when you want low-level access (e.g. encode a function
  //    call manually); otherwise prefer the higher-level `Contract` class.
  // ---------------------------------------------------------------------------
  const iface = new Interface(counterAbi)

  console.log(`\nEndpoints (${counterAbi.endpoints.length}):`)
  for (const ep of counterAbi.endpoints) {
    const args = ep.inputs.map((i) => `${i.name}: ${i.type}`).join(', ')
    const out = ep.outputs.map((o) => o.type).join(', ')
    console.log(`  ${ep.mutability.padEnd(8)} ${ep.name}(${args})${out ? ' -> ' + out : ''}`)
  }

  console.log(`\nEvents (${counterAbi.events.length}):`)
  for (const ev of counterAbi.events) {
    const args = ev.inputs
      .map((i) => `${i.name}: ${i.type}${i.indexed ? ' (indexed)' : ''}`)
      .join(', ')
    console.log(`  ${ev.identifier}(${args})`)
  }

  // ---------------------------------------------------------------------------
  // 3. Demonstrate Interface-level encoding (advanced, optional):
  //    encode a call to `add(5)`. The bytes are what the SDK injects into a
  //    SmartContract tx's `arguments` field.
  // ---------------------------------------------------------------------------
  if (typeof (iface as { encodeFunctionCall?: unknown }).encodeFunctionCall === 'function') {
    try {
      const callBytes = (iface as { encodeFunctionCall: (n: string, a: unknown[]) => unknown }).encodeFunctionCall('add', [5n])
      console.log(`\nEncoded add(5) -> ${callBytes}`)
    } catch (err) {
      console.warn('  (could not encode add(5) at this Interface API surface)', err)
    }
  }

  console.log('\nDone.')
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err)
  process.exit(1)
})
