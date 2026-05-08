/**
 * Example: claim-staking-rewards (Flow 24, Node side)
 *
 * Claims accrued staking rewards. There are several reward streams:
 *
 *   - claimType 0 (APR / StakingClaim) — the default validator-staking yield.
 *     Rewards are paid in KLV.
 *   - claimType 1 (AllowanceClaim)     — operator/validator allowances.
 *   - claimType 3 (FPR / KDA Pool)     — rewards from freezing a specific KDA
 *     (requires `id` to be set to that KDA id).
 *
 * The umbrella `@klever/connect` does not export the `ClaimType` enum, so we use
 * numeric literals with explanatory comments.
 *
 * SDK call
 * --------
 * `wallet.sendTransaction({ contractType: 9, claimType, id? })`
 *   - contractType 9 = TXType.Claim
 *   - claimType: 0 | 1 | 3 as above
 *   - id: required for type 3 (FPR), absent for type 0
 */

import 'node:process'

import { KleverProvider, NodeWallet } from '@klever/connect'

const NETWORK = (process.env['KLV_NETWORK'] ?? 'testnet') as 'mainnet' | 'testnet' | 'devnet'
const PRIVATE_KEY = process.env['KLV_PRIVATE_KEY']
const CLAIM_TYPE = Number(process.env['KLV_CLAIM_TYPE'] ?? '0')
const CLAIM_KDA = process.env['KLV_CLAIM_KDA'] || undefined

if (!PRIVATE_KEY) {
  console.error('Error: KLV_PRIVATE_KEY is required.')
  process.exit(1)
}
if (CLAIM_TYPE === 3 && !CLAIM_KDA) {
  console.error('Error: claimType 3 (FPR) requires KLV_CLAIM_KDA to be set.')
  process.exit(1)
}

async function main(): Promise<void> {
  const provider = new KleverProvider({ network: NETWORK })
  const wallet = new NodeWallet(provider, PRIVATE_KEY as string)
  await wallet.connect()
  console.log(`Sender: ${wallet.address}`)
  console.log(`Claim type: ${CLAIM_TYPE}${CLAIM_KDA ? ` (KDA=${CLAIM_KDA})` : ''}`)

  try {
    const result = await wallet.sendTransaction({
      contractType: 9, // TXType.Claim
      claimType: CLAIM_TYPE,
      ...(CLAIM_KDA ? { id: CLAIM_KDA } : {}),
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
  console.error('claim-staking-rewards failed:', err instanceof Error ? err.message : err)
  process.exit(1)
})
