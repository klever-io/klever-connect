/**
 * Example: deposit (Flow 48)
 *
 * Deposits into either an FPR (Flat Per-Reward) validator pool or a KDA
 * reward pool via contractType 23 (`Deposit`).
 *
 * Why two depositTypes
 * --------------------
 * - **FPR (depositType=0)**: KLV is added to a validator's reward pool. Each
 *   epoch the chain distributes pool rewards to delegators in proportion to
 *   their effective stake. Used by validators to bootstrap or top up rewards.
 * - **KDA (depositType=1)**: tokens are added to a specific KDA's reward pool
 *   (e.g. an APR-yielding token). The recipient KDA must have staking enabled.
 *
 * Wire shape (`DepositRequest`)
 * -----------------------------
 * - `depositType`: 0 (FPR) or 1 (KDA).
 * - `kda`: required when depositType=1.
 * - `currencyId`: optional currency to deposit (defaults to KLV for FPR).
 * - `amount`: required raw smallest-unit amount.
 */

import 'node:process'

import {
  KleverProvider,
  NodeWallet,
  TransactionBuilder,
  type DepositRequest,
} from '@klever/connect'

const NETWORK = (process.env['KLV_NETWORK'] ?? 'testnet') as
  | 'mainnet'
  | 'testnet'
  | 'devnet'
  | 'local'
const PRIVATE_KEY = process.env['PRIVATE_KEY']
const DEPOSIT_TYPE_RAW = process.env['DEPOSIT_TYPE'] ?? '0'
const KDA_ID = process.env['KDA_ID']
const CURRENCY_ID = process.env['CURRENCY_ID']
const AMOUNT = process.env['AMOUNT']
const DRY_RUN = (process.env['DRY_RUN'] ?? 'true').toLowerCase() === 'true'

if (!PRIVATE_KEY) {
  console.error('Error: PRIVATE_KEY is required.')
  process.exit(1)
}
if (!AMOUNT) {
  console.error('Error: AMOUNT is required.')
  process.exit(1)
}

async function main(): Promise<void> {
  const depositType = Number(DEPOSIT_TYPE_RAW)
  if (depositType !== 0 && depositType !== 1) {
    throw new Error(`DEPOSIT_TYPE must be 0 (FPR) or 1 (KDA); got ${DEPOSIT_TYPE_RAW}.`)
  }
  if (depositType === 1 && (!KDA_ID || KDA_ID.length === 0)) {
    throw new Error('KDA_ID is required when DEPOSIT_TYPE=1 (KDA pool).')
  }

  const request: DepositRequest = {
    depositType,
    amount: AMOUNT as string,
  }
  if (KDA_ID && KDA_ID.length > 0) request.kda = KDA_ID
  if (CURRENCY_ID && CURRENCY_ID.length > 0) request.currencyId = CURRENCY_ID

  const provider = new KleverProvider({ network: NETWORK })
  const wallet = new NodeWallet(provider, PRIVATE_KEY as string)
  await wallet.connect()
  console.log(`Depositor: ${wallet.address}`)
  console.log(`Network:   ${NETWORK}`)
  console.log(`Pool:      ${depositType === 0 ? 'FPR (validator)' : `KDA "${KDA_ID}"`}`)
  console.log('Deposit request:')
  console.log(JSON.stringify(request, null, 2))

  const builder = new TransactionBuilder(provider)
  builder.sender(wallet.address).deposit(request)
  const tx = await builder.build()
  const signed = await wallet.signTransaction(tx)

  if (DRY_RUN) {
    console.log('DRY_RUN=true — not broadcasting.')
    await wallet.disconnect(true)
    return
  }
  const hash = await wallet.broadcastTransaction(signed)
  console.log(`Deposit tx hash: ${hash}`)
  console.log(`Explorer:        ${provider.getTransactionUrl(hash)}`)
  await wallet.disconnect(true)
}

main().catch((err) => {
  console.error('deposit failed:', err instanceof Error ? err.message : err)
  process.exit(1)
})
