/**
 * Example: validator-config (Flow 36)
 *
 * Updates an existing validator's on-chain configuration via contractType 3
 * (`ValidatorConfig`). Unlike CreateValidator (flow 35), this does NOT register
 * a new validator — it mutates an entry already linked to your operator account.
 *
 * Field semantics
 * ---------------
 * Every field except `blsPublicKey` is OPTIONAL on the request type. The chain
 * treats missing fields as "leave unchanged", so this example sends only the
 * subset you provide via env vars. That mirrors how a real ops dashboard would
 * batch up exactly the deltas the operator wants to apply.
 *
 * Common reasons to send this transaction:
 *   - Lower the commission to attract more delegators.
 *   - Toggle `canDelegate` off temporarily (e.g. while migrating nodes).
 *   - Bump `maxDelegationAmount` after a hardware upgrade.
 *   - Update the reward payout address (e.g. moving rewards to a cold wallet).
 *
 * Imports — settled rule of this example library
 * ----------------------------------------------
 * Always import from the umbrella `@klever/connect`.
 */

import 'node:process'

import {
  KleverProvider,
  NodeWallet,
  TransactionBuilder,
  parseKLV,
  type ValidatorConfigRequest,
} from '@klever/connect'

const NETWORK = (process.env['KLV_NETWORK'] ?? 'testnet') as
  | 'mainnet'
  | 'testnet'
  | 'devnet'
  | 'local'
const PRIVATE_KEY = process.env['PRIVATE_KEY']
const BLS_PUBLIC_KEY = process.env['BLS_PUBLIC_KEY']
const REWARD_ADDRESS = process.env['REWARD_ADDRESS']
const CAN_DELEGATE_RAW = process.env['CAN_DELEGATE']
const COMMISSION_RAW = process.env['COMMISSION']
const MAX_DELEGATION_AMOUNT = process.env['MAX_DELEGATION_AMOUNT']
const VALIDATOR_NAME = process.env['VALIDATOR_NAME']
const DRY_RUN = (process.env['DRY_RUN'] ?? 'true').toLowerCase() === 'true'

if (!PRIVATE_KEY) {
  console.error('Error: PRIVATE_KEY is required.')
  process.exit(1)
}
if (!BLS_PUBLIC_KEY) {
  console.error('Error: BLS_PUBLIC_KEY is required (identifies the validator to update).')
  process.exit(1)
}

async function main(): Promise<void> {
  const provider = new KleverProvider({ network: NETWORK })
  const wallet = new NodeWallet(provider, PRIVATE_KEY as string)
  await wallet.connect()
  console.log(`Operator: ${wallet.address}`)
  console.log(`Network:  ${NETWORK}`)

  // -------------------------------------------------------------------------
  // Build the partial-update request. We only set fields the user actually
  // supplied so the chain leaves everything else untouched.
  // -------------------------------------------------------------------------
  const request: ValidatorConfigRequest = {
    blsPublicKey: BLS_PUBLIC_KEY as string,
  }
  if (REWARD_ADDRESS && REWARD_ADDRESS.length > 0) {
    request.rewardAddress = REWARD_ADDRESS
  }
  if (CAN_DELEGATE_RAW !== undefined && CAN_DELEGATE_RAW !== '') {
    request.canDelegate = CAN_DELEGATE_RAW.toLowerCase() === 'true'
  }
  if (COMMISSION_RAW !== undefined && COMMISSION_RAW !== '') {
    const commission = Number(COMMISSION_RAW)
    if (!Number.isFinite(commission) || commission < 0 || commission > 10_000) {
      throw new Error(`COMMISSION must be 0..10000 (got: ${COMMISSION_RAW}).`)
    }
    request.commission = commission
  }
  if (MAX_DELEGATION_AMOUNT !== undefined && MAX_DELEGATION_AMOUNT !== '') {
    request.maxDelegationAmount = parseKLV(MAX_DELEGATION_AMOUNT)
  }
  if (VALIDATOR_NAME !== undefined && VALIDATOR_NAME !== '') {
    request.name = VALIDATOR_NAME
  }

  console.log('ValidatorConfig partial update:')
  console.log(JSON.stringify(request, (_k, v) => (typeof v === 'bigint' ? v.toString() : v), 2))

  // -------------------------------------------------------------------------
  // Build, sign, broadcast (or dry-run).
  // -------------------------------------------------------------------------
  const builder = new TransactionBuilder(provider)
  builder.sender(wallet.address).validatorConfig(request)
  const unsigned = await builder.build()
  const signed = await wallet.signTransaction(unsigned)

  if (DRY_RUN) {
    console.log('DRY_RUN=true — not broadcasting. Set DRY_RUN=false to submit.')
    await wallet.disconnect(true)
    return
  }
  const hash = await wallet.broadcastTransaction(signed)
  console.log(`Broadcast OK. Hash: ${hash}`)
  console.log(`Explorer: ${provider.getTransactionUrl(hash)}`)
  await wallet.disconnect(true)
}

main().catch((err) => {
  console.error('validator-config failed:', err instanceof Error ? err.message : err)
  process.exit(1)
})
