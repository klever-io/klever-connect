/**
 * Example: sc-invoke-mutable (Flow 58, Node side)
 *
 * Calls a mutable (state-changing) function on a deployed smart contract via
 * `Contract.invoke(...)`. Pairs with the `counter` fixture under
 * `examples/_fixtures/counter/`. Once the Rust toolchain has produced
 * `output/counter.wasm` + `output/counter.abi.json`, this example deploys the
 * contract (via flow 60), then calls `increment` to bump the counter.
 *
 * What `Contract.invoke` does
 * ---------------------------
 * Internally, `invoke` builds a `SmartContract` (contractType 63) transaction
 * with `scType=0` (invoke existing contract), encodes the function name and
 * arguments per the ABI, signs with the supplied wallet, and broadcasts.
 *
 * For read-only calls use `contract.call(fn, args)` instead — that uses
 * `provider.queryContract` (no tx, no fee).
 *
 * Pre-flight: WASM/ABI prerequisite paths
 * ---------------------------------------
 * Build the counter fixture once:
 *
 *   cd examples/_fixtures/counter
 *   sc-meta all build           # produces output/counter.wasm + output/counter.abi.json
 *
 * If you don't yet have the Rust toolchain, the test file mocks the ABI so the
 * mocked vitest still passes. Live testnet runs require the build artifacts.
 */

import 'node:process'
import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

import {
  Contract,
  KleverProvider,
  NodeWallet,
  createKleverAddress,
  type ContractABI,
} from '@klever/connect'

const NETWORK = (process.env['KLV_NETWORK'] ?? 'testnet') as
  | 'mainnet'
  | 'testnet'
  | 'devnet'
  | 'local'
const PRIVATE_KEY = process.env['PRIVATE_KEY']
const CONTRACT_ADDRESS = process.env['CONTRACT_ADDRESS']
const ABI_PATH = resolve(
  process.env['ABI_PATH'] ?? '../_fixtures/counter/output/counter.abi.json',
)
const FUNCTION_NAME = process.env['FUNCTION_NAME'] ?? 'increment'
const FUNCTION_ARGS = (process.env['FUNCTION_ARGS'] ?? '')
  .split(',')
  .map((s) => s.trim())
  .filter((s) => s.length > 0)
const DRY_RUN = (process.env['DRY_RUN'] ?? 'true').toLowerCase() === 'true'

if (!PRIVATE_KEY) {
  console.error('Error: PRIVATE_KEY is required.')
  process.exit(1)
}
if (!CONTRACT_ADDRESS) {
  console.error('Error: CONTRACT_ADDRESS is required.')
  process.exit(1)
}
if (!existsSync(ABI_PATH)) {
  console.error(`Error: ABI file not found at ${ABI_PATH}.`)
  console.error(
    'Build the counter fixture first: `cd examples/_fixtures/counter && sc-meta all build`.',
  )
  process.exit(1)
}

async function main(): Promise<void> {
  const abi = JSON.parse(readFileSync(ABI_PATH, 'utf-8')) as ContractABI

  const provider = new KleverProvider({ network: NETWORK })
  const wallet = new NodeWallet(provider, PRIVATE_KEY as string)
  await wallet.connect()
  console.log(`Caller:           ${wallet.address}`)
  console.log(`Contract address: ${CONTRACT_ADDRESS}`)
  console.log(`Function:         ${FUNCTION_NAME}(${FUNCTION_ARGS.join(', ')})`)
  console.log(`Network:          ${NETWORK}`)

  if (DRY_RUN) {
    console.log('DRY_RUN=true — would invoke but skipping. Set DRY_RUN=false to send.')
    await wallet.disconnect(true)
    return
  }

  // The Contract class accepts a wallet (Signer) so it can sign the resulting
  // tx. For pure reads, pass a provider instead.
  const addr = createKleverAddress(CONTRACT_ADDRESS as string)
  const contract = new Contract(addr, abi, wallet)

  const result = await contract.invoke(FUNCTION_NAME, ...FUNCTION_ARGS)
  console.log(`Invoke tx hash: ${result.hash}`)
  console.log(`Status:         ${result.status}`)
  console.log(`Explorer:       ${provider.getTransactionUrl(result.hash)}`)
  await wallet.disconnect(true)
}

main().catch((err) => {
  console.error('sc-invoke-mutable failed:', err instanceof Error ? err.message : err)
  process.exit(1)
})
