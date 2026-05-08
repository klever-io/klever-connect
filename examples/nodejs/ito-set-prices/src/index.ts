/**
 * Example: ito-set-prices (Flow 44)
 *
 * Stage 2 of the ITO lifecycle: update an existing ITO's pack prices via
 * contractType 16 (`SetITOPrices`). This is a focused mutation: it ONLY
 * touches `packInfo` (the per-currency tier table). Other ITO settings — start
 * times, whitelist, max amount — are untouched.
 *
 * Wire shape (`SetITOPricesRequest`)
 * ----------------------------------
 * - `kda`: required asset id.
 * - `packInfo`: required Record<currencyId, PackInfo>. PackInfo is `{ packs:
 *   [{ amount, price }] }`.
 *
 * Use this rather than re-issuing a full ConfigITO when you only need to bump
 * prices — it's cheaper at the contract level and avoids accidentally clobbering
 * unrelated configuration.
 */

import 'node:process'

import {
  KleverProvider,
  NodeWallet,
  TransactionBuilder,
  type SetITOPricesRequest,
} from '@klever/connect'

const NETWORK = (process.env['KLV_NETWORK'] ?? 'testnet') as
  | 'mainnet'
  | 'testnet'
  | 'devnet'
  | 'local'
const PRIVATE_KEY = process.env['PRIVATE_KEY']
const KDA_ID = process.env['KDA_ID']
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
if (!PACK_INFO_JSON) {
  console.error('Error: PACK_INFO_JSON is required.')
  process.exit(1)
}

async function main(): Promise<void> {
  const packInfo = JSON.parse(PACK_INFO_JSON as string) as SetITOPricesRequest['packInfo']

  const request: SetITOPricesRequest = {
    kda: KDA_ID as string,
    packInfo,
  }

  const provider = new KleverProvider({ network: NETWORK })
  const wallet = new NodeWallet(provider, PRIVATE_KEY as string)
  await wallet.connect()
  console.log(`ITO owner: ${wallet.address}`)
  console.log(`Network:   ${NETWORK}`)
  console.log('SetITOPrices request:')
  console.log(JSON.stringify(request, null, 2))

  const builder = new TransactionBuilder(provider)
  builder.sender(wallet.address).setITOPrices(request)
  const tx = await builder.build()
  const signed = await wallet.signTransaction(tx)

  if (DRY_RUN) {
    console.log('DRY_RUN=true — not broadcasting.')
    await wallet.disconnect(true)
    return
  }
  const hash = await wallet.broadcastTransaction(signed)
  console.log(`SetITOPrices tx hash: ${hash}`)
  console.log(`Explorer:             ${provider.getTransactionUrl(hash)}`)
  await wallet.disconnect(true)
}

main().catch((err) => {
  console.error('ito-set-prices failed:', err instanceof Error ? err.message : err)
  process.exit(1)
})
