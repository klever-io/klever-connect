/**
 * Example: undelegate (Flow 23, Node side)
 *
 * Removes the validator association from a bucket. The bucket stays frozen and
 * still belongs to you, but it stops earning rewards. After undelegating you
 * can either re-delegate to a different validator, or proceed to `unfreeze`
 * (Flow 21) to start the cooldown.
 *
 * Prerequisite chain
 * ------------------
 *   freeze-for-staking → delegate-to-validator → THIS → unfreeze → withdraw-after-cooldown
 *
 * SDK call
 * --------
 * `wallet.sendTransaction({ contractType: 7, bucketId })`
 *   - contractType 7 = TXType.Undelegate
 *   - bucketId = the bucket currently delegated
 */

import 'node:process'

import { KleverProvider, NodeWallet } from '@klever/connect'

const NETWORK = (process.env['KLV_NETWORK'] ?? 'testnet') as 'mainnet' | 'testnet' | 'devnet'
const PRIVATE_KEY = process.env['KLV_PRIVATE_KEY']
const BUCKET_ID = process.env['KLV_BUCKET_ID']

if (!PRIVATE_KEY) {
  console.error('Error: KLV_PRIVATE_KEY is required.')
  process.exit(1)
}
if (!BUCKET_ID) {
  console.error('Error: KLV_BUCKET_ID is required.')
  process.exit(1)
}

async function main(): Promise<void> {
  const provider = new KleverProvider({ network: NETWORK })
  const wallet = new NodeWallet(provider, PRIVATE_KEY as string)
  await wallet.connect()
  console.log(`Sender: ${wallet.address}`)
  console.log(`Undelegating bucket ${BUCKET_ID}`)

  try {
    const result = await wallet.sendTransaction({
      contractType: 7, // TXType.Undelegate
      bucketId: BUCKET_ID as string,
    })
    console.log(`Submitted: hash=${result.hash} status=${result.status}`)

    if (result.wait) {
      const receipt = await result.wait()
      console.log(`Confirmed: status=${receipt.status}`)
      console.log('Bucket undelegated. Next: run unfreeze to start the cooldown.')
    }
  } finally {
    await wallet.disconnect(true)
  }
}

main().catch((err) => {
  console.error('undelegate failed:', err instanceof Error ? err.message : err)
  process.exit(1)
})
