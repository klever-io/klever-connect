/**
 * All Transaction Types Example
 *
 * Shows how to build each supported transaction type using TransactionBuilder.
 * wallet.sendTransaction() accepts a ContractRequestData object with contractType.
 *
 * Each transaction type is available as a named constant via TXType from @klever/connect-core.
 * Full list: Transfer, CreateAsset, Freeze, Unfreeze, Delegate, Undelegate,
 *            Withdraw, Claim, Vote, AssetTrigger, SmartContract, and more.
 *
 * NOTE: Each sendTransaction() call fetches the latest nonce from the node.
 * If the previous transaction hasn't landed in the mempool yet, two calls in
 * rapid succession may use the same nonce and one will be rejected. In
 * production, either await result.wait() between calls or manage nonces manually.
 */

import 'dotenv/config'
import { KleverProvider } from '@klever/connect-provider'
import { NodeWallet } from '@klever/connect-wallet'
import { parseKLV } from '@klever/connect-core'
import { ClaimType } from '@klever/connect-encoding'

const VALIDATOR =
  process.env['VALIDATOR'] ?? 'klv1rj8uef37nfa8ezndupnplvnmgpwg2z9z723vrp9sypytkh3caqdsf4xe5d'
const BUCKET_ID = process.env['BUCKET_ID'] ?? '' // KLV bucket from a previous Freeze tx

async function main(): Promise<void> {
  const privateKey = process.env['PRIVATE_KEY']
  if (!privateKey) {
    throw new Error('Set PRIVATE_KEY environment variable')
  }

  const provider = new KleverProvider({ network: 'testnet' })
  const wallet = new NodeWallet(provider, privateKey)
  await wallet.connect()

  try {
    console.log('Sender:', wallet.address)

    // ── Transfer ─────────────────────────────────────────────────────────────
    const transfer = await wallet.sendTransaction({
      contractType: 0, // TXType.Transfer
      receiver: VALIDATOR,
      amount: parseKLV('1'),
      // kda: 'MY-TOKEN-ABCD', // optional: send a specific KDA instead of KLV
    })
    console.log('Transfer:', transfer.hash)

    // ── Freeze ───────────────────────────────────────────────────────────────
    // Lock KLV to earn staking rewards; returns a bucketId in the receipt
    const freeze = await wallet.sendTransaction({
      contractType: 4, // TXType.Freeze
      amount: parseKLV('100'),
      // kda: 'KDA-TOKEN', // optional: freeze a KDA token
    })
    console.log('Freeze:', freeze.hash)

    // ── Delegate ─────────────────────────────────────────────────────────────
    // Delegate a frozen KLV bucket to a validator
    if (BUCKET_ID) {
      const delegate = await wallet.sendTransaction({
        contractType: 6, // TXType.Delegate
        receiver: VALIDATOR,
        bucketId: BUCKET_ID,
      })
      console.log('Delegate:', delegate.hash)

      // ── Undelegate ───────────────────────────────────────────────────────
      // Remove delegation (bucket stays frozen, can be unfrozen after cooldown)
      const undelegate = await wallet.sendTransaction({
        contractType: 7, // TXType.Undelegate
        bucketId: BUCKET_ID,
      })
      console.log('Undelegate:', undelegate.hash)

      // ── Unfreeze ─────────────────────────────────────────────────────────
      // Unlock the frozen bucket after the undelegate cooldown period
      const unfreeze = await wallet.sendTransaction({
        contractType: 5, // TXType.Unfreeze
        kda: 'KLV',
        bucketId: BUCKET_ID,
      })
      console.log('Unfreeze:', unfreeze.hash)
    } else {
      console.log('Set BUCKET_ID env var to test Delegate/Undelegate/Unfreeze')
    }

    // ── Claim ────────────────────────────────────────────────────────────────
    // Claim staking rewards
    const claim = await wallet.sendTransaction({
      contractType: 9, // TXType.Claim
      claimType: ClaimType.StakingClaim,
    })
    console.log('Claim:', claim.hash)

    // ── Vote ─────────────────────────────────────────────────────────────────
    // Vote on a governance proposal (type: 0 = Yes, 1 = No)
    // Requires an active proposal ID — check the Klever explorer for open proposals.
    // const vote = await wallet.sendTransaction({
    //   contractType: 14, // TXType.Vote
    //   type: 0,          // 0 = Yes, 1 = No
    //   proposalId: 1,    // replace with an active proposal ID
    // })
    // console.log('Vote:', vote.hash)
  } finally {
    await wallet.disconnect(true)
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err)
  process.exit(1)
})
