/**
 * Example: account-set-name (Flow 46)
 *
 * Sets a human-readable alias on an account via contractType 12
 * (`SetAccountName`). After a non-dry-run broadcast, the example optionally
 * polls `provider.getAccount(address)` until the chain reflects the new name.
 *
 * Why a verify step
 * -----------------
 * The chain assigns the alias only after the transaction is mined. A successful
 * `broadcastTransaction` just means the node accepted the bytes — the user-facing
 * "your name was set" UX needs an explicit verification round-trip.
 */

import 'node:process'

import {
  KleverProvider,
  NodeWallet,
  TransactionBuilder,
  type SetAccountNameRequest,
  type KleverAddress,
} from '@klever/connect'

const NETWORK = (process.env['KLV_NETWORK'] ?? 'testnet') as
  | 'mainnet'
  | 'testnet'
  | 'devnet'
  | 'local'
const PRIVATE_KEY = process.env['PRIVATE_KEY']
const ACCOUNT_NAME = process.env['ACCOUNT_NAME']
const DRY_RUN = (process.env['DRY_RUN'] ?? 'true').toLowerCase() === 'true'
const VERIFY = (process.env['VERIFY_AFTER_BROADCAST'] ?? 'true').toLowerCase() === 'true'

if (!PRIVATE_KEY) {
  console.error('Error: PRIVATE_KEY is required.')
  process.exit(1)
}
if (!ACCOUNT_NAME) {
  console.error('Error: ACCOUNT_NAME is required.')
  process.exit(1)
}

async function main(): Promise<void> {
  const provider = new KleverProvider({ network: NETWORK })
  const wallet = new NodeWallet(provider, PRIVATE_KEY as string)
  await wallet.connect()
  console.log(`Account:   ${wallet.address}`)
  console.log(`Network:   ${NETWORK}`)
  console.log(`Set name:  ${ACCOUNT_NAME}`)

  const request: SetAccountNameRequest = { name: ACCOUNT_NAME as string }
  const builder = new TransactionBuilder(provider)
  builder.sender(wallet.address).setAccountName(request)
  const tx = await builder.build()
  const signed = await wallet.signTransaction(tx)

  if (DRY_RUN) {
    console.log('DRY_RUN=true — not broadcasting.')
    await wallet.disconnect(true)
    return
  }
  const hash = await wallet.broadcastTransaction(signed)
  console.log(`SetAccountName tx hash: ${hash}`)

  if (VERIFY) {
    // -------------------------------------------------------------------------
    // Poll for up to 30 seconds. The KleverProvider's `waitForTransaction`
    // tells us when the tx is mined; once mined, we re-fetch the account and
    // confirm the name landed.
    // -------------------------------------------------------------------------
    console.log('Waiting for inclusion + name propagation...')
    await provider.waitForTransaction(hash)
    const account = await provider.getAccount(wallet.address as KleverAddress)
    const observed = (account as { name?: string }).name ?? '<not set>'
    console.log(`Observed name on chain: ${observed}`)
    if (observed !== ACCOUNT_NAME) {
      console.warn('WARN: chain did not yet reflect the new name. Try again in a few seconds.')
    }
  }
  await wallet.disconnect(true)
}

main().catch((err) => {
  console.error('account-set-name failed:', err instanceof Error ? err.message : err)
  process.exit(1)
})
