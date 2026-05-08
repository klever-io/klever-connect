/**
 * Example: governance-create-proposal (Flow 37)
 *
 * Submits a governance Proposal transaction (contractType 13). On Klever, any
 * KLV holder with sufficient stake can propose changes to chain parameters by
 * publishing a `ProposalRequest`. Once mined, the proposal opens for voting
 * (see flow 38 — governance-vote).
 *
 * Wire shape (`ProposalRequest`)
 * ------------------------------
 * - `parameters`: a Record<number, string> — keys are the integer chain
 *    parameter IDs being changed, values are the proposed new values as
 *    strings (so big integers don't overflow JSON).
 * - `description`: optional free-form text shown to voters.
 * - `epochsDuration`: optional integer — how many epochs the proposal stays
 *    open. The chain has a default if you omit this.
 *
 * The example reads the parameters as a JSON env var so callers can build the
 * exact map they want without code changes.
 */

import 'node:process'

import {
  KleverProvider,
  NodeWallet,
  TransactionBuilder,
  type ProposalRequest,
} from '@klever/connect'

const NETWORK = (process.env['KLV_NETWORK'] ?? 'testnet') as
  | 'mainnet'
  | 'testnet'
  | 'devnet'
  | 'local'
const PRIVATE_KEY = process.env['PRIVATE_KEY']
const PARAMETERS_JSON = process.env['PROPOSAL_PARAMETERS']
const DESCRIPTION = process.env['PROPOSAL_DESCRIPTION']
const EPOCHS_DURATION_RAW = process.env['PROPOSAL_EPOCHS_DURATION']
const DRY_RUN = (process.env['DRY_RUN'] ?? 'true').toLowerCase() === 'true'

if (!PRIVATE_KEY) {
  console.error('Error: PRIVATE_KEY is required.')
  process.exit(1)
}
if (!PARAMETERS_JSON) {
  console.error('Error: PROPOSAL_PARAMETERS is required (JSON map of paramId -> new value).')
  process.exit(1)
}

async function main(): Promise<void> {
  // -------------------------------------------------------------------------
  // Step 1 — parse the parameters JSON into the SDK's expected shape.
  // The SDK accepts Record<number, string>; JSON keys come in as strings, so
  // we coerce explicitly and validate they parse as positive integers.
  // -------------------------------------------------------------------------
  const rawParams = JSON.parse(PARAMETERS_JSON as string) as Record<string, string>
  const parameters: Record<number, string> = {}
  for (const [k, v] of Object.entries(rawParams)) {
    const id = Number(k)
    if (!Number.isInteger(id) || id < 0) {
      throw new Error(`Invalid parameter id "${k}" — must be a non-negative integer.`)
    }
    if (typeof v !== 'string') {
      throw new Error(`Parameter ${k} value must be a JSON string (got ${typeof v}).`)
    }
    parameters[id] = v
  }

  const request: ProposalRequest = { parameters }
  if (DESCRIPTION && DESCRIPTION.length > 0) {
    request.description = DESCRIPTION
  }
  if (EPOCHS_DURATION_RAW !== undefined && EPOCHS_DURATION_RAW !== '') {
    const ed = Number(EPOCHS_DURATION_RAW)
    if (!Number.isInteger(ed) || ed < 1) {
      throw new Error(`PROPOSAL_EPOCHS_DURATION must be a positive integer.`)
    }
    request.epochsDuration = ed
  }

  // -------------------------------------------------------------------------
  // Step 2 — connect, build, sign.
  // -------------------------------------------------------------------------
  const provider = new KleverProvider({ network: NETWORK })
  const wallet = new NodeWallet(provider, PRIVATE_KEY as string)
  await wallet.connect()
  console.log(`Proposer: ${wallet.address}`)
  console.log(`Network:  ${NETWORK}`)
  console.log('Proposal request:')
  console.log(JSON.stringify(request, null, 2))

  const builder = new TransactionBuilder(provider)
  builder.sender(wallet.address).proposal(request)
  const tx = await builder.build()
  const signed = await wallet.signTransaction(tx)

  if (DRY_RUN) {
    console.log('DRY_RUN=true — not broadcasting.')
    await wallet.disconnect(true)
    return
  }

  // -------------------------------------------------------------------------
  // Step 3 — broadcast and report. The transaction receipt will contain the
  // proposal id once mined; downstream tools (and flow 38) reference it.
  // -------------------------------------------------------------------------
  const hash = await wallet.broadcastTransaction(signed)
  console.log(`Proposal tx hash: ${hash}`)
  console.log(`Explorer: ${provider.getTransactionUrl(hash)}`)
  console.log('Look up the receipt to find the assigned proposalId, then use flow 38 to vote.')
  await wallet.disconnect(true)
}

main().catch((err) => {
  console.error('governance-create-proposal failed:', err instanceof Error ? err.message : err)
  process.exit(1)
})
