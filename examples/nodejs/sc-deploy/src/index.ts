/**
 * Example: sc-deploy (Flow 60)
 *
 * Deploys a compiled WASM smart contract using `ContractFactory`. The example
 * pairs with the `counter` Rust fixture under `examples/_fixtures/counter/`,
 * but accepts any `WASM_PATH` + `ABI_PATH` so you can drop in your own contract.
 *
 * Pre-flight: build the counter fixture
 * -------------------------------------
 *   cd examples/_fixtures/counter
 *   sc-meta all build
 * Produces:
 *   examples/_fixtures/counter/output/counter.wasm
 *   examples/_fixtures/counter/output/counter.abi.json
 *
 * Lifecycle of the example
 * ------------------------
 *   1. Read WASM bytes + ABI JSON from disk.
 *   2. Construct a ContractFactory(abi, bytecode, signer, deployMetadata).
 *   3. `factory.deploy(...constructorArgs)` — builds + signs + broadcasts.
 *   4. Wait for the transaction receipt and resolve the deployed address via
 *      `ContractFactory.getDeployedAddress(receipt)`.
 *   5. Print the address so callers can pipe it into flows 58, 59, 63.
 */

import 'node:process'
import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

import {
  ContractFactory,
  KleverProvider,
  NodeWallet,
  type ContractABI,
  type TransactionHash,
} from '@klever/connect'

const NETWORK = (process.env['KLV_NETWORK'] ?? 'testnet') as
  | 'mainnet'
  | 'testnet'
  | 'devnet'
  | 'local'
const PRIVATE_KEY = process.env['PRIVATE_KEY']
const WASM_PATH = resolve(process.env['WASM_PATH'] ?? '../_fixtures/counter/output/counter.wasm')
const ABI_PATH = resolve(
  process.env['ABI_PATH'] ?? '../_fixtures/counter/output/counter.abi.json',
)
const CONSTRUCTOR_ARGS = (process.env['CONSTRUCTOR_ARGS'] ?? '')
  .split(',')
  .map((s) => s.trim())
  .filter((s) => s.length > 0)

const META_UPGRADEABLE = (process.env['META_UPGRADEABLE'] ?? 'true').toLowerCase() === 'true'
const META_READABLE = (process.env['META_READABLE'] ?? 'true').toLowerCase() === 'true'
const META_PAYABLE = (process.env['META_PAYABLE'] ?? 'false').toLowerCase() === 'true'
const META_PAYABLE_BY_SC =
  (process.env['META_PAYABLE_BY_SC'] ?? 'false').toLowerCase() === 'true'

if (!PRIVATE_KEY) {
  console.error('Error: PRIVATE_KEY is required.')
  process.exit(1)
}
if (!existsSync(WASM_PATH)) {
  console.error(`Error: WASM file not found at ${WASM_PATH}.`)
  console.error(
    'Build the counter fixture first: `cd examples/_fixtures/counter && sc-meta all build`.',
  )
  process.exit(1)
}
if (!existsSync(ABI_PATH)) {
  console.error(`Error: ABI file not found at ${ABI_PATH}.`)
  process.exit(1)
}

async function main(): Promise<void> {
  const bytecode = new Uint8Array(readFileSync(WASM_PATH))
  const abi = JSON.parse(readFileSync(ABI_PATH, 'utf-8')) as ContractABI

  const provider = new KleverProvider({ network: NETWORK })
  const wallet = new NodeWallet(provider, PRIVATE_KEY as string)
  await wallet.connect()
  console.log(`Deployer: ${wallet.address}`)
  console.log(`Network:  ${NETWORK}`)
  console.log(`WASM size: ${bytecode.byteLength} bytes`)
  console.log(`Constructor args: [${CONSTRUCTOR_ARGS.join(', ')}]`)

  const factory = new ContractFactory(abi, bytecode, wallet, {
    upgradeable: META_UPGRADEABLE,
    readable: META_READABLE,
    payable: META_PAYABLE,
    payableBySC: META_PAYABLE_BY_SC,
  })

  // factory.deploy returns a Contract whose .address is the placeholder zero
  // address until we resolve the receipt.
  const contract = await factory.deploy(...CONSTRUCTOR_ARGS)
  const deployTx = (contract as unknown as { deployTransaction?: { hash: TransactionHash } })
    .deployTransaction
  if (!deployTx?.hash) {
    throw new Error('Factory.deploy did not attach a deployTransaction reference.')
  }
  console.log(`Deploy tx hash: ${deployTx.hash}`)
  console.log('Waiting for the deploy receipt to resolve the contract address...')

  // The receipt yields the real contract address.
  await provider.waitForTransaction(deployTx.hash)
  const receipt = await provider.getTransactionReceipt(deployTx.hash)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const address = ContractFactory.getDeployedAddress(receipt as any)
  console.log(`Contract deployed at: ${address}`)
  console.log('Pipe this address into flow 58 / 59 / 63 to interact with the contract.')

  await wallet.disconnect(true)
}

main().catch((err) => {
  console.error('sc-deploy failed:', err instanceof Error ? err.message : err)
  process.exit(1)
})
