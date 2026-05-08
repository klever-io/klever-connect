/**
 * Example: delegate-to-validator (Flow 22, Node side)
 *
 * Assigns a frozen KLV bucket to a validator. The validator's commission rate
 * is configured by them; the rest of the staking yield flows to you.
 *
 * Prerequisites
 * -------------
 *   - KLV_BUCKET_ID from a prior freeze (Flow 20).
 *   - KLV_VALIDATOR bech32 address. Get one from the Klever explorer's "Validators"
 *     tab — pick one with a reasonable commission and a non-zero "canDelegate" flag.
 *
 * SDK call
 * --------
 * `wallet.sendTransaction({ contractType: 6, receiver: validator, bucketId })`
 *   - contractType 6 = TXType.Delegate
 *   - receiver = the validator's bech32 address
 *   - bucketId = the bucket from your freeze receipt
 */

import 'node:process'

import { KleverProvider, NodeWallet, ValidationError, isValidAddress } from '@klever/connect'

const NETWORK = (process.env['KLV_NETWORK'] ?? 'testnet') as 'mainnet' | 'testnet' | 'devnet'
const PRIVATE_KEY = process.env['KLV_PRIVATE_KEY']
const BUCKET_ID = process.env['KLV_BUCKET_ID']
const VALIDATOR = process.argv[2] ?? process.env['KLV_VALIDATOR']

if (!PRIVATE_KEY) {
  console.error('Error: KLV_PRIVATE_KEY is required.')
  process.exit(1)
}
if (!BUCKET_ID) {
  console.error('Error: KLV_BUCKET_ID is required (run freeze-for-staking first).')
  process.exit(1)
}
if (!VALIDATOR) {
  console.error('Error: KLV_VALIDATOR (or argv[2]) is required.')
  process.exit(1)
}

async function main(): Promise<void> {
  const provider = new KleverProvider({ network: NETWORK })
  const wallet = new NodeWallet(provider, PRIVATE_KEY as string)
  await wallet.connect()
  console.log(`Sender: ${wallet.address}`)

  try {
    if (!isValidAddress(VALIDATOR as string)) {
      throw new ValidationError(`Invalid validator address: ${VALIDATOR}`)
    }
    console.log(`Delegating bucket ${BUCKET_ID} to ${VALIDATOR}`)

    const result = await wallet.sendTransaction({
      contractType: 6, // TXType.Delegate
      receiver: VALIDATOR as string,
      bucketId: BUCKET_ID as string,
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
  console.error('delegate-to-validator failed:', err instanceof Error ? err.message : err)
  process.exit(1)
})
