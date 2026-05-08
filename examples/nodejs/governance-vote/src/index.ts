/**
 * Example: governance-vote (Flow 38, Node side)
 *
 * Casts a Yes/No vote on an open Klever governance proposal via contractType 14
 * (`Vote`).
 *
 * Wire shape (`VoteRequest`)
 * --------------------------
 * - `type`: 0 = YES, 1 = NO. The SDK does NOT export named constants for these,
 *    so we map an env-friendly "yes"/"no" string into the integer ourselves.
 * - `proposalId`: integer id of the proposal you want to vote on.
 * - `amount`: optional stake-weighted vote amount in raw KLV. Most chains weight
 *    the vote by stake; leaving this off lets the chain compute the weight from
 *    the voter's available stake at vote time.
 *
 * Why this example takes the vote choice from an env var
 * ------------------------------------------------------
 * To keep one binary that demonstrates BOTH outcomes (per the task brief):
 * `VOTE=yes` and `VOTE=no` produce different bytes on the wire and are both
 * useful pedagogically.
 */

import 'node:process'

import {
  KleverProvider,
  NodeWallet,
  TransactionBuilder,
  type VoteRequest,
} from '@klever/connect'

// VoteType encoding (defined by the chain proto):
//   YES = 0
//   NO  = 1
const VOTE_TYPES: Record<string, number> = { yes: 0, no: 1 }

const NETWORK = (process.env['KLV_NETWORK'] ?? 'testnet') as
  | 'mainnet'
  | 'testnet'
  | 'devnet'
  | 'local'
const PRIVATE_KEY = process.env['PRIVATE_KEY']
const PROPOSAL_ID_RAW = process.env['PROPOSAL_ID']
const VOTE_RAW = (process.env['VOTE'] ?? '').toLowerCase()
const AMOUNT_RAW = process.env['VOTE_AMOUNT']
const DRY_RUN = (process.env['DRY_RUN'] ?? 'true').toLowerCase() === 'true'

if (!PRIVATE_KEY) {
  console.error('Error: PRIVATE_KEY is required.')
  process.exit(1)
}
if (PROPOSAL_ID_RAW === undefined || PROPOSAL_ID_RAW === '') {
  console.error('Error: PROPOSAL_ID is required (numeric).')
  process.exit(1)
}
if (!(VOTE_RAW in VOTE_TYPES)) {
  console.error(`Error: VOTE must be "yes" or "no" (got: "${VOTE_RAW}").`)
  process.exit(1)
}

async function main(): Promise<void> {
  const proposalId = Number(PROPOSAL_ID_RAW)
  if (!Number.isInteger(proposalId) || proposalId < 0) {
    throw new Error(`PROPOSAL_ID must be a non-negative integer (got: ${PROPOSAL_ID_RAW}).`)
  }
  const voteType = VOTE_TYPES[VOTE_RAW] as number

  const request: VoteRequest = {
    type: voteType,
    proposalId,
  }
  if (AMOUNT_RAW !== undefined && AMOUNT_RAW !== '') {
    // Treat as raw smallest units (string) so big values don't overflow.
    request.amount = AMOUNT_RAW
  }

  const provider = new KleverProvider({ network: NETWORK })
  const wallet = new NodeWallet(provider, PRIVATE_KEY as string)
  await wallet.connect()
  console.log(`Voter:      ${wallet.address}`)
  console.log(`Network:    ${NETWORK}`)
  console.log(`ProposalId: ${proposalId}`)
  console.log(`Choice:     ${VOTE_RAW.toUpperCase()} (type=${voteType})`)
  if (request.amount) {
    console.log(`Amount:     ${request.amount} (raw)`)
  } else {
    console.log('Amount:     <chain default — uses voter\'s available stake>')
  }

  // -------------------------------------------------------------------------
  // Build, sign, broadcast (or dry-run).
  // -------------------------------------------------------------------------
  const builder = new TransactionBuilder(provider)
  builder.sender(wallet.address).vote(request)
  const tx = await builder.build()
  const signed = await wallet.signTransaction(tx)

  if (DRY_RUN) {
    console.log('DRY_RUN=true — not broadcasting.')
    await wallet.disconnect(true)
    return
  }

  const hash = await wallet.broadcastTransaction(signed)
  console.log(`Vote tx hash: ${hash}`)
  console.log(`Explorer:     ${provider.getTransactionUrl(hash)}`)
  await wallet.disconnect(true)
}

main().catch((err) => {
  console.error('governance-vote failed:', err instanceof Error ? err.message : err)
  process.exit(1)
})
