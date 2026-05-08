/**
 * Example: unfreeze (Flow 21, Node side, stage of staking chain)
 *
 * Stops staking on a bucket and begins the cooldown countdown. Once cooldown
 * elapses you can call `withdraw-after-cooldown` (Flow 25) to return the funds
 * to the liquid balance.
 *
 * Prerequisite chain:
 *   1. freeze-for-staking (Flow 20) — produced KLV_BUCKET_ID
 *   2. (optional) undelegate (Flow 23) if the bucket was delegated
 *   3. THIS example
 *   4. withdraw-after-cooldown (Flow 25) — after the cooldown window
 *
 * SDK call
 * --------
 * `wallet.sendTransaction({ contractType: 5, kda, bucketId })`
 *   - contractType 5 = TXType.Unfreeze
 *   - kda is required (use 'KLV' for native)
 *   - bucketId is the hex id printed in the freeze tx's receipt
 */

import 'node:process'

import { KleverProvider, NodeWallet } from '@klever/connect'

const NETWORK = (process.env['KLV_NETWORK'] ?? 'testnet') as 'mainnet' | 'testnet' | 'devnet'
const PRIVATE_KEY = process.env['KLV_PRIVATE_KEY']
const BUCKET_ID = process.env['KLV_BUCKET_ID']
const KDA = process.env['KLV_KDA'] ?? 'KLV'

if (!PRIVATE_KEY) {
  console.error('Error: KLV_PRIVATE_KEY is required.')
  process.exit(1)
}
if (!BUCKET_ID) {
  console.error('Error: KLV_BUCKET_ID is required (run freeze-for-staking first).')
  process.exit(1)
}

async function main(): Promise<void> {
  const provider = new KleverProvider({ network: NETWORK })
  const wallet = new NodeWallet(provider, PRIVATE_KEY as string)
  await wallet.connect()
  console.log(`Sender: ${wallet.address}`)
  console.log(`Unfreezing bucket ${BUCKET_ID} of ${KDA}`)

  try {
    const result = await wallet.sendTransaction({
      contractType: 5, // TXType.Unfreeze
      kda: KDA,
      bucketId: BUCKET_ID as string,
    })
    console.log(`Submitted: hash=${result.hash} status=${result.status}`)

    if (result.wait) {
      const receipt = await result.wait()
      console.log(`Confirmed: status=${receipt.status}`)
      console.log('Cooldown started. After it elapses, run withdraw-after-cooldown.')
    }
  } finally {
    await wallet.disconnect(true)
  }
}

main().catch((err) => {
  console.error('unfreeze failed:', err instanceof Error ? err.message : err)
  process.exit(1)
})
