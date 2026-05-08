/**
 * Example: sc-deploy-and-interact-end-to-end (Flow 63)
 *
 * Long-running example that walks through the full smart-contract lifecycle:
 *
 *   1. Deploy the counter contract (`ContractFactory.deploy`).
 *   2. Wait for the deploy receipt and resolve the contract address.
 *   3. Call `increment` N times via `contract.invoke`.
 *   4. Read `getCount` via `contract.call` to confirm state changed.
 *   5. Parse contract logs from the last receipt with `contract.parseEvents`.
 *
 * Prerequisites
 * -------------
 *   - Build the counter fixture once (Rust toolchain): `cd examples/_fixtures/counter && sc-meta all build`.
 *   - PRIVATE_KEY funded with enough KLV on the chosen network.
 *
 * This example does NOT have a DRY_RUN flag — its purpose is to actually
 * exercise the chain end-to-end. The mocked vitest covers the wiring; live
 * testnet runs cost a small amount of KLV.
 */

import 'node:process'
import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

import {
  Contract,
  ContractFactory,
  KleverProvider,
  NodeWallet,
  createKleverAddress,
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
const INCREMENT_TIMES = Math.max(1, Number(process.env['INCREMENT_TIMES'] ?? '3'))

if (!PRIVATE_KEY) {
  console.error('Error: PRIVATE_KEY is required.')
  process.exit(1)
}
if (!existsSync(WASM_PATH) || !existsSync(ABI_PATH)) {
  console.error(`Error: build the counter fixture first (WASM/ABI not found).`)
  console.error(`  cd examples/_fixtures/counter && sc-meta all build`)
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

  // -------------------------------------------------------------------------
  // 1) Deploy
  // -------------------------------------------------------------------------
  const factory = new ContractFactory(abi, bytecode, wallet)
  const deployed = await factory.deploy()
  const deployTx = (deployed as unknown as { deployTransaction?: { hash: TransactionHash } })
    .deployTransaction
  if (!deployTx?.hash) throw new Error('No deploy tx hash returned by factory.deploy()')
  console.log(`Deploy tx hash: ${deployTx.hash}`)

  // -------------------------------------------------------------------------
  // 2) Resolve address from the receipt
  // -------------------------------------------------------------------------
  await provider.waitForTransaction(deployTx.hash)
  const deployReceipt = await provider.getTransactionReceipt(deployTx.hash)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const contractAddress = ContractFactory.getDeployedAddress(deployReceipt as any)
  console.log(`Contract address: ${contractAddress}`)

  // -------------------------------------------------------------------------
  // 3) Increment N times
  // -------------------------------------------------------------------------
  const contract = new Contract(createKleverAddress(contractAddress), abi, wallet)
  let lastReceipt: unknown = null
  let lastTxHash: TransactionHash | null = null
  for (let i = 0; i < INCREMENT_TIMES; i++) {
    const r = await contract.invoke('increment')
    console.log(`increment #${i + 1}: tx=${r.hash}`)
    await provider.waitForTransaction(r.hash)
    lastTxHash = r.hash
    lastReceipt = await provider.getTransactionReceipt(r.hash)
  }

  // -------------------------------------------------------------------------
  // 4) Read state via the readonly getCount endpoint
  // -------------------------------------------------------------------------
  const count = await contract.call<bigint | number | string>('getCount')
  console.log(`getCount() => ${count}`)

  // -------------------------------------------------------------------------
  // 5) Parse logs from the last increment receipt (if the contract emits any).
  // -------------------------------------------------------------------------
  if (lastReceipt && typeof lastReceipt === 'object' && 'logs' in lastReceipt) {
    const logs = (lastReceipt as { logs?: unknown }).logs
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const events = contract.parseEvents(logs as any)
    console.log(`Parsed ${events.length} contract event(s) from tx ${lastTxHash}.`)
    for (const ev of events) {
      console.log(`  - ${(ev as { identifier?: string }).identifier ?? '<unknown>'}`)
    }
  }

  console.log('End-to-end lifecycle complete.')
  await wallet.disconnect(true)
}

main().catch((err) => {
  console.error(
    'sc-deploy-and-interact-end-to-end failed:',
    err instanceof Error ? err.message : err,
  )
  process.exit(1)
})
