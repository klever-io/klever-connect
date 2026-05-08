/**
 * Example: kda-pause-resume (Flow 34)
 *
 * Pauses or resumes all transfers of a KDA. The action is selected by argv[2]:
 *   - "pause"  → triggerType 3 (Pause)
 *   - "resume" → triggerType 4 (Resume)
 *
 * One folder, two npm scripts:
 *   npm run pause   # tsx src/index.ts pause
 *   npm run resume  # tsx src/index.ts resume
 *
 * Why a single folder?
 * --------------------
 * The two operations are mirror images of each other — they share env config,
 * tests, and gotchas. Splitting into two folders would duplicate every file
 * for negligible educational gain.
 *
 * Required: asset must have been created with `canPause: true` (immutable).
 *
 * SDK call
 * --------
 * `wallet.sendTransaction({ contractType: 11, triggerType: 3 | 4, assetId })`
 *   - contractType 11 = TXType.AssetTrigger
 *   - triggerType 3   = Pause
 *   - triggerType 4   = Resume
 */

import 'node:process'

import { KleverProvider, NodeWallet } from '@klever/connect'

const NETWORK = (process.env['KLV_NETWORK'] ?? 'testnet') as 'mainnet' | 'testnet' | 'devnet'
const PRIVATE_KEY = process.env['KLV_PRIVATE_KEY']
const KDA_ID = process.env['KLV_KDA_ID']
const ACTION = (process.argv[2] ?? 'pause').toLowerCase()

if (!PRIVATE_KEY) {
  console.error('Error: KLV_PRIVATE_KEY is required.')
  process.exit(1)
}
if (!KDA_ID) {
  console.error('Error: KLV_KDA_ID is required.')
  process.exit(1)
}
if (ACTION !== 'pause' && ACTION !== 'resume') {
  console.error(`Error: action must be "pause" or "resume" (got "${ACTION}").`)
  process.exit(1)
}

async function main(): Promise<void> {
  const provider = new KleverProvider({ network: NETWORK })
  const wallet = new NodeWallet(provider, PRIVATE_KEY as string)
  await wallet.connect()
  console.log(`Owner: ${wallet.address}`)

  const triggerType = ACTION === 'pause' ? 3 : 4
  console.log(`${ACTION === 'pause' ? 'Pausing' : 'Resuming'} ${KDA_ID} (triggerType=${triggerType})`)

  try {
    const result = await wallet.sendTransaction({
      contractType: 11, // TXType.AssetTrigger
      triggerType, // 3 = Pause, 4 = Resume
      assetId: KDA_ID as string,
    })
    console.log(`Submitted: hash=${result.hash} status=${result.status}`)

    if (result.wait) {
      const receipt = await result.wait()
      console.log(`Confirmed: status=${receipt.status}`)
    }
  } finally {
    await wallet.disconnect(true)
  }
}

main().catch((err) => {
  console.error('kda-pause-resume failed:', err instanceof Error ? err.message : err)
  process.exit(1)
})
