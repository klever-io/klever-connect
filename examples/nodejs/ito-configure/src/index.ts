/**
 * Example: ito-configure (Flow 43)
 *
 * Configures an Initial Token Offering for a KDA via contractType 15
 * (`ConfigITO`). The ITO controls who can buy the token, at what prices, and
 * during which time windows.
 *
 * Lifecycle of an ITO (this example library)
 * ------------------------------------------
 *   Stage 1 — `ito-configure`     (this example)  contractType 15
 *   Stage 2 — `ito-set-prices`    (flow 44)         contractType 16
 *   Stage 3 — `ito-buy-from-ito`  (flow 45)         contractType 17 (Buy with buyType=1)
 *
 * Wire shape (`ConfigITORequest`)
 * -------------------------------
 * - `kda`: required asset id whose ITO is being configured.
 * - `receiverAddress`: where sale proceeds go (defaults to the signer).
 * - `status`: 0/1/2 → Inactive / Active / Paused.
 * - `maxAmount`: total cap on tokens sold.
 * - `packInfo`: per-currency price tiers (PackInfo: { packs: [{amount, price}] }).
 * - `defaultLimitPerAddress`: per-buyer cap unless overridden by whitelist.
 * - `whitelistStatus`, `whitelistInfo`, `whitelist*Time`, `start/endTime`.
 *
 * The example takes `packInfo` as a JSON env var so the whole map is
 * inspectable and reproducible.
 */

import 'node:process'

import {
  KleverProvider,
  NodeWallet,
  TransactionBuilder,
  type ConfigITORequest,
} from '@klever/connect'

const NETWORK = (process.env['KLV_NETWORK'] ?? 'testnet') as
  | 'mainnet'
  | 'testnet'
  | 'devnet'
  | 'local'
const PRIVATE_KEY = process.env['PRIVATE_KEY']
const KDA_ID = process.env['KDA_ID']
const RECEIVER_ADDRESS = process.env['RECEIVER_ADDRESS']
const STATUS_RAW = process.env['STATUS']
const MAX_AMOUNT = process.env['MAX_AMOUNT']
const DEFAULT_LIMIT_PER_ADDRESS = process.env['DEFAULT_LIMIT_PER_ADDRESS']
const WHITELIST_STATUS_RAW = process.env['WHITELIST_STATUS']
const START_TIME = process.env['START_TIME']
const END_TIME = process.env['END_TIME']
const WHITELIST_START_TIME = process.env['WHITELIST_START_TIME']
const WHITELIST_END_TIME = process.env['WHITELIST_END_TIME']
const PACK_INFO_JSON = process.env['PACK_INFO_JSON']
const DRY_RUN = (process.env['DRY_RUN'] ?? 'true').toLowerCase() === 'true'

if (!PRIVATE_KEY) {
  console.error('Error: PRIVATE_KEY is required.')
  process.exit(1)
}
if (!KDA_ID) {
  console.error('Error: KDA_ID is required.')
  process.exit(1)
}

async function main(): Promise<void> {
  const request: ConfigITORequest = { kda: KDA_ID as string }

  if (RECEIVER_ADDRESS && RECEIVER_ADDRESS.length > 0) {
    request.receiverAddress = RECEIVER_ADDRESS
  }
  if (STATUS_RAW !== undefined && STATUS_RAW !== '') request.status = Number(STATUS_RAW)
  if (MAX_AMOUNT && MAX_AMOUNT.length > 0) request.maxAmount = MAX_AMOUNT
  if (DEFAULT_LIMIT_PER_ADDRESS && DEFAULT_LIMIT_PER_ADDRESS.length > 0) {
    request.defaultLimitPerAddress = DEFAULT_LIMIT_PER_ADDRESS
  }
  if (WHITELIST_STATUS_RAW !== undefined && WHITELIST_STATUS_RAW !== '') {
    request.whitelistStatus = Number(WHITELIST_STATUS_RAW)
  }
  if (START_TIME) request.startTime = START_TIME
  if (END_TIME) request.endTime = END_TIME
  if (WHITELIST_START_TIME) request.whitelistStartTime = WHITELIST_START_TIME
  if (WHITELIST_END_TIME) request.whitelistEndTime = WHITELIST_END_TIME
  if (PACK_INFO_JSON && PACK_INFO_JSON.length > 0) {
    request.packInfo = JSON.parse(PACK_INFO_JSON) as ConfigITORequest['packInfo']
  }

  const provider = new KleverProvider({ network: NETWORK })
  const wallet = new NodeWallet(provider, PRIVATE_KEY as string)
  await wallet.connect()
  console.log(`ITO owner: ${wallet.address}`)
  console.log(`Network:   ${NETWORK}`)
  console.log('ConfigITO request:')
  console.log(JSON.stringify(request, null, 2))

  const builder = new TransactionBuilder(provider)
  builder.sender(wallet.address).configITO(request)
  const tx = await builder.build()
  const signed = await wallet.signTransaction(tx)

  if (DRY_RUN) {
    console.log('DRY_RUN=true — not broadcasting.')
    await wallet.disconnect(true)
    return
  }
  const hash = await wallet.broadcastTransaction(signed)
  console.log(`ConfigITO tx hash: ${hash}`)
  console.log(`Explorer:          ${provider.getTransactionUrl(hash)}`)
  await wallet.disconnect(true)
}

main().catch((err) => {
  console.error('ito-configure failed:', err instanceof Error ? err.message : err)
  process.exit(1)
})
