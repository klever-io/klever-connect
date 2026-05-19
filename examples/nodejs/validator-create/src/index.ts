/**
 * Example: validator-create (Flow 35)
 *
 * Registers a new validator on the Klever blockchain using contractType 2
 * (CreateValidator). This is the on-chain step that turns a running node into
 * an active block producer/voter, provided the node's BLS key was already
 * generated and onboarded according to the network's genesis/registration rules.
 *
 * Prerequisite reading
 * --------------------
 * A real validator setup involves three layers:
 *   1. Run a Klever node binary and generate its BLS key — this lives entirely
 *      OFF-CHAIN. The output is a 96-byte BLS public key (192 hex chars).
 *   2. (Mainnet/testnet) Submit the BLS key for genesis or onboarding through
 *      the network's official process. Without this, broadcasting the transaction
 *      below will succeed locally but the chain will reject the validator at
 *      consensus time.
 *   3. ONLY THEN run this example to publish the on-chain CreateValidator
 *      transaction that ties the BLS key to the operator account, declares the
 *      commission, and (optionally) opens delegation.
 *
 * What this example demonstrates
 * ------------------------------
 * - Reading every CreateValidator field from the environment (no hardcoded keys).
 * - Building the CreateValidator request via the umbrella `@klever/connect`.
 * - Sending it through `wallet.sendTransaction({ contractType: 2, ... })`, which
 *   internally constructs a `Transaction` via `TransactionBuilder`, signs it with
 *   the wallet's Ed25519 private key, and broadcasts via the provider.
 * - Honoring DRY_RUN=true so you can inspect the signed transaction without
 *   spending fees or risking a "BLS key not eligible" failure on testnet.
 *
 * Imports — settled rule of this example library
 * ----------------------------------------------
 * Always import from the umbrella `@klever/connect`. Sub-package imports
 * (`@klever/connect-wallet`, etc.) are intentionally NOT used.
 */

import 'node:process'

import {
  KleverProvider,
  NodeWallet,
  TransactionBuilder,
  parseKLV,
  type CreateValidatorRequest,
} from '@klever/connect'

// ---------------------------------------------------------------------------
// Step 0 — read configuration from the environment.
// ---------------------------------------------------------------------------
const NETWORK = (process.env['KLV_NETWORK'] ?? 'testnet') as
  | 'mainnet'
  | 'testnet'
  | 'devnet'
  | 'local'
const PRIVATE_KEY = process.env['PRIVATE_KEY']
const BLS_PUBLIC_KEY = process.env['BLS_PUBLIC_KEY']
const REWARD_ADDRESS = process.env['REWARD_ADDRESS']
const CAN_DELEGATE = (process.env['CAN_DELEGATE'] ?? 'true').toLowerCase() === 'true'
const COMMISSION_RAW = process.env['COMMISSION'] ?? '500'
const MAX_DELEGATION_AMOUNT = process.env['MAX_DELEGATION_AMOUNT']
const VALIDATOR_NAME = process.env['VALIDATOR_NAME']
const DRY_RUN = (process.env['DRY_RUN'] ?? 'true').toLowerCase() === 'true'

if (!PRIVATE_KEY) {
  console.error('Error: PRIVATE_KEY environment variable is required.')
  process.exit(1)
}
if (!BLS_PUBLIC_KEY) {
  console.error('Error: BLS_PUBLIC_KEY environment variable is required.')
  console.error('Generate it with the Klever node CLI BEFORE running this example. The chain will')
  console.error('reject any BLS key that has not been registered through the proper channel.')
  process.exit(1)
}

const commission = Number(COMMISSION_RAW)
if (!Number.isFinite(commission) || commission < 0 || commission > 10_000) {
  console.error(`Error: COMMISSION must be a number between 0 and 10000 (got: ${COMMISSION_RAW}).`)
  process.exit(1)
}

async function main(): Promise<void> {
  // -------------------------------------------------------------------------
  // Step 1 — connect a NodeWallet using the operator's private key. This wallet
  // signs the CreateValidator transaction and pays the chain fee.
  // -------------------------------------------------------------------------
  const provider = new KleverProvider({ network: NETWORK })
  const wallet = new NodeWallet(provider, PRIVATE_KEY as string)
  await wallet.connect()
  console.log(`Operator address: ${wallet.address}`)
  console.log(`Network:          ${NETWORK}`)

  // -------------------------------------------------------------------------
  // Step 2 — build the CreateValidator request. Every optional field is mapped
  // explicitly so the wire shape is obvious and reproducible.
  // -------------------------------------------------------------------------
  const request: CreateValidatorRequest = {
    blsPublicKey: BLS_PUBLIC_KEY as string,
    ownerAddress: wallet.address,
    rewardAddress: REWARD_ADDRESS && REWARD_ADDRESS.length > 0 ? REWARD_ADDRESS : wallet.address,
    canDelegate: CAN_DELEGATE,
    commission,
    ...(MAX_DELEGATION_AMOUNT ? { maxDelegationAmount: parseKLV(MAX_DELEGATION_AMOUNT) } : {}),
    ...(VALIDATOR_NAME ? { name: VALIDATOR_NAME } : {}),
  }
  console.log('CreateValidator request prepared:')
  console.log(
    JSON.stringify(
      { ...request, blsPublicKey: maskBls(request.blsPublicKey) },
      (_k, v) => (typeof v === 'bigint' ? v.toString() : v),
      2,
    ),
  )

  // -------------------------------------------------------------------------
  // Step 3 — build the transaction via TransactionBuilder so the example can
  // either dry-run (sign-only) or fully broadcast through the wallet.
  // -------------------------------------------------------------------------
  const builder = new TransactionBuilder(provider)
  builder.sender(wallet.address).createValidator(request)
  const unsignedTx = await builder.build()

  // Sign the transaction up front; signing is local/offline and cheap. We then
  // decide whether to broadcast based on the DRY_RUN flag.
  const signedTx = await wallet.signTransaction(unsignedTx)
  console.log(`Signed transaction hex (truncated): ${signedTx.toHex().slice(0, 80)}...`)

  if (DRY_RUN) {
    console.log('DRY_RUN=true — skipping broadcast. Set DRY_RUN=false to actually submit.')
    await wallet.disconnect(true)
    return
  }

  // -------------------------------------------------------------------------
  // Step 4 — broadcast and report the resulting hash. Success here means the
  // node accepted the transaction; cluster-level acceptance of the validator
  // role still depends on the BLS key being registered upstream.
  // -------------------------------------------------------------------------
  const hash = await wallet.broadcastTransaction(signedTx)
  console.log(`Broadcast OK. Transaction hash: ${hash}`)
  console.log(`Explorer: ${provider.getTransactionUrl(hash)}`)

  await wallet.disconnect(true)
}

function maskBls(key: string): string {
  if (key.length <= 16) {
    return key
  }
  return `${key.slice(0, 8)}…${key.slice(-8)} (length=${key.length})`
}

main().catch((err) => {
  console.error('validator-create failed:', err instanceof Error ? err.message : err)
  process.exit(1)
})
