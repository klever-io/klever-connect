/**
 * Example: withdraw-after-cooldown (Flow 25, Node side)
 *
 * Final stage of the staking lifecycle. Returns the unfrozen bucket's funds to
 * your liquid balance. Will fail if the cooldown window has not yet elapsed.
 *
 * Prerequisite chain
 * ------------------
 *   freeze-for-staking → delegate-to-validator → claim-staking-rewards (loop)
 *   → undelegate → unfreeze → wait for cooldown → THIS example
 *
 * Cooldown windows are a network parameter and may take many epochs (hours to
 * days). To rehearse the example without waiting, run on devnet where epochs
 * are short, or use the mocked test.
 *
 * SDK call
 * --------
 * `wallet.sendTransaction({ contractType: 8, kda, withdrawType })`
 *   - contractType 8 = TXType.Withdraw
 *   - kda = the asset of the matured bucket (use 'KLV' for native)
 *   - withdrawType: 0 (staking) or 1 (KDA Pool / FPR)
 */

import 'node:process'

import { KleverProvider, NodeWallet } from '@klever/connect'

const NETWORK = (process.env['KLV_NETWORK'] ?? 'testnet') as 'mainnet' | 'testnet' | 'devnet'
const PRIVATE_KEY = process.env['KLV_PRIVATE_KEY']
const WITHDRAW_TYPE = Number(process.env['KLV_WITHDRAW_TYPE'] ?? '0')
const KDA = process.env['KLV_KDA'] ?? 'KLV'

if (!PRIVATE_KEY) {
  console.error('Error: KLV_PRIVATE_KEY is required.')
  process.exit(1)
}

async function main(): Promise<void> {
  const provider = new KleverProvider({ network: NETWORK })
  const wallet = new NodeWallet(provider, PRIVATE_KEY as string)
  await wallet.connect()
  console.log(`Sender: ${wallet.address}`)
  console.log(`Withdrawing ${KDA} (withdrawType=${WITHDRAW_TYPE})`)

  try {
    const result = await wallet.sendTransaction({
      contractType: 8, // TXType.Withdraw
      kda: KDA,
      withdrawType: WITHDRAW_TYPE,
    })
    console.log(`Submitted: hash=${result.hash} status=${result.status}`)

    if (result.wait) {
      const receipt = await result.wait()
      console.log(`Confirmed: status=${receipt.status}`)
      console.log('Funds returned to liquid balance.')
    }
  } finally {
    await wallet.disconnect(true)
  }
}

main().catch((err) => {
  console.error('withdraw-after-cooldown failed:', err instanceof Error ? err.message : err)
  process.exit(1)
})
