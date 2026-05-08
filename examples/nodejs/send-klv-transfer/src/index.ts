/**
 * Example: send-klv-transfer (Flow 17, Node side)
 *
 * The "hello world" of Klever: send 1 KLV from a Node-side wallet to a recipient.
 *
 *   1. Build a `KleverProvider` for the chosen network (testnet by default).
 *   2. Construct a `NodeWallet` from `KLV_PRIVATE_KEY` and `connect()`.
 *   3. Validate the recipient address with `isValidAddress`.
 *   4. Call `wallet.transfer({ receiver, amount: parseKLV('1') })`.
 *      - `parseKLV('1')` → `1_000_000n` (KLV has 6 decimals).
 *      - Internally this builds a Transfer (contractType=0) tx, signs it, and broadcasts.
 *   5. Wait for confirmation via the optional `result.wait()` returned by the SDK.
 *
 * For sending KDA tokens instead of KLV, see `examples/nodejs/send-kda-transfer/`.
 *
 * Settled rule: always import from the `@klever/connect` umbrella.
 */

import 'node:process'

import {
  KleverProvider,
  NodeWallet,
  ValidationError,
  isValidAddress,
  parseKLV,
} from '@klever/connect'

const NETWORK = (process.env['KLV_NETWORK'] ?? 'testnet') as 'mainnet' | 'testnet' | 'devnet'
const PRIVATE_KEY = process.env['KLV_PRIVATE_KEY']
const RAW_RECIPIENT = process.argv[2] ?? process.env['KLV_RECIPIENT']
const AMOUNT_KLV = process.env['KLV_AMOUNT'] ?? '1'

if (!PRIVATE_KEY) {
  console.error('Error: KLV_PRIVATE_KEY environment variable is required.')
  console.error('Copy .env.example to .env and supply a funded testnet key.')
  process.exit(1)
}

async function main(): Promise<void> {
  // Step 1 — provider for the chosen network.
  const provider = new KleverProvider({ network: NETWORK })

  // Step 2 — wallet from the env private key.
  const wallet = new NodeWallet(provider, PRIVATE_KEY as string)
  await wallet.connect()
  console.log(`Sender: ${wallet.address}`)

  try {
    // Step 3 — resolve and validate the recipient (defaults to self-send).
    const recipient = RAW_RECIPIENT ?? wallet.address
    if (!isValidAddress(recipient)) {
      throw new ValidationError(`Invalid recipient address: ${recipient}`)
    }
    console.log(`Recipient: ${recipient}`)
    console.log(`Amount: ${AMOUNT_KLV} KLV (${parseKLV(AMOUNT_KLV)} smallest units)`)

    // Step 4 — broadcast the transfer.
    // `wallet.transfer` is a convenience over `sendTransaction({ contractType: 0, ... })`.
    const result = await wallet.transfer({
      receiver: recipient,
      amount: parseKLV(AMOUNT_KLV),
    })
    console.log(`Submitted: hash=${result.hash} status=${result.status}`)

    // Step 5 — optional confirmation. Older provider versions may not implement
    // `wait`, so guard the call.
    if (result.wait) {
      const receipt = await result.wait()
      console.log(`Confirmed: status=${receipt.status}`)
    } else {
      console.log('Provider does not implement wait(); poll getTransaction(hash) instead.')
    }
  } finally {
    // Always wipe the private key, success or failure.
    await wallet.disconnect(true)
  }
}

main().catch((err) => {
  console.error('send-klv-transfer failed:', err instanceof Error ? err.message : err)
  process.exit(1)
})
