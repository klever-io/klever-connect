/**
 * Example: sc-invoke-payable-with-klv (Flow 59, Node side)
 *
 * Invokes a payable smart contract function while sending KLV alongside the
 * call. The pattern is identical to `sc-invoke-mutable` (flow 58) except that
 * we pass `{ value: { KLV: parseKLV('10') } }` as the call options.
 *
 * How `value` works
 * -----------------
 * The Klever VM exposes the attached funds to the contract via the
 * `callValue` field on the SC request. The SDK accepts a map of `assetId ->
 * AmountLike`, so you can also send KDAs:
 *
 *   contract.invoke('myFn', ...args, { value: { KFI: 1_000_000n } })
 *   contract.invoke('myFn', ...args, { value: { KLV: parseKLV('10'), KFI: parseKLV('5') } })
 *
 * The receiving contract must be `payable` (the deploy metadata flag) and the
 * specific function must accept payment. Calling a non-payable endpoint with
 * `value` set will be rejected at chain level.
 */

import 'node:process'
import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

import {
  Contract,
  KleverProvider,
  NodeWallet,
  createKleverAddress,
  parseKLV,
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
const FUNCTION_NAME = process.env['FUNCTION_NAME'] ?? 'topUp'
const FUNCTION_ARGS = (process.env['FUNCTION_ARGS'] ?? '')
  .split(',')
  .map((s) => s.trim())
  .filter((s) => s.length > 0)
const KLV_AMOUNT = process.env['KLV_AMOUNT'] ?? '10'
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
  console.error(`Error: ABI not found at ${ABI_PATH}.`)
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
  console.log(`Sending KLV:      ${KLV_AMOUNT}`)
  console.log(`Network:          ${NETWORK}`)

  if (DRY_RUN) {
    console.log('DRY_RUN=true — would invoke + pay but skipping.')
    await wallet.disconnect(true)
    return
  }

  const contract = new Contract(
    createKleverAddress(CONTRACT_ADDRESS as string),
    abi,
    wallet,
  )
  const klvRaw = parseKLV(KLV_AMOUNT)
  const result = await contract.invoke(FUNCTION_NAME, ...FUNCTION_ARGS, {
    value: { KLV: klvRaw },
  })
  console.log(`Invoke tx hash: ${result.hash}`)
  console.log(`Status:         ${result.status}`)
  console.log(`Explorer:       ${provider.getTransactionUrl(result.hash)}`)
  await wallet.disconnect(true)
}

main().catch((err) => {
  console.error(
    'sc-invoke-payable-with-klv failed:',
    err instanceof Error ? err.message : err,
  )
  process.exit(1)
})
