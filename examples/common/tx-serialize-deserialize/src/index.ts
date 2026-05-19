/**
 * Flow #16 — tx-serialize-deserialize
 *
 * Why you'd want to do this:
 *
 *   - Hardware signers (Ledger, KeepKey, etc.) consume proto bytes, sign
 *     them inside the device, and return a signed payload. Hex is the
 *     transport format.
 *   - QR codes between devices.
 *   - Persisting an unsigned tx to disk for review.
 *   - Air-gapped signing (build on an online machine, sign on an offline
 *     machine, broadcast back online).
 *
 * SDK API:
 *   - tx.toHex()          : Transaction -> 0x-less hex string
 *   - Transaction.fromHex : hex string -> Transaction
 *
 * The round-trip is byte-exact: `Transaction.fromHex(tx.toHex()).toHex() === tx.toHex()`.
 *
 * This example does NOT broadcast — signing requires a private key, which
 * means the nodejs/ category. Here we focus on the offline serialization
 * primitives.
 */

import {
  KleverProvider,
  Transaction,
  TransactionBuilder,
  parseKLV,
  createKleverAddress,
  isValidAddress,
} from '@klever/connect'

async function main(): Promise<void> {
  const network = (process.env['KLV_NETWORK'] ?? 'testnet') as
    | 'mainnet' | 'testnet' | 'devnet' | 'local'
  const provider = new KleverProvider({ network })

  const senderRaw = process.env['KLEVER_SENDER'] ??
    'klv1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqpgm89z'
  if (!isValidAddress(senderRaw)) throw new Error(`Invalid sender: ${senderRaw}`)
  const sender = createKleverAddress(senderRaw)
  const receiver = createKleverAddress(process.env['KLEVER_RECEIVER'] ?? sender)

  // 1. Build a tx (node-assisted) so we have a fully-encoded proto to play with.
  const tx = await new TransactionBuilder(provider)
    .sender(sender)
    .transfer({ receiver, amount: parseKLV('0.001') })
    .build()

  // 2. Serialize to hex.
  const hex = tx.toHex()
  console.log(`Serialized hex (${hex.length / 2} bytes): ${hex.slice(0, 64)}...`)

  // 3. Deserialize from hex.
  //    Imagine the hex string traveled over a USB cable to a hardware signer
  //    or got scanned from a QR code by another device.
  let recovered: Transaction
  try {
    recovered = Transaction.fromHex(hex)
  } catch (err) {
    throw new Error(
      `Transaction.fromHex failed: ${err instanceof Error ? err.message : String(err)}`,
      { cause: err },
    )
  }

  // 4. Verify byte-exact round trip.
  const matches = recovered.toHex() === hex
  console.log(`Byte-exact round trip: ${matches}`)

  // 5. Useful introspection: pull a few fields off the recovered Transaction.
  const proto = (recovered as unknown as { rawData?: { sender?: Uint8Array; nonce?: number } }).rawData
  if (proto) {
    console.log(`Recovered nonce      : ${proto.nonce}`)
  }

  // 6. Show what the signing flow would look like (we don't run it).
  console.log(`
To sign and broadcast this hex from a hardware signer:
  1. Send hex to the signer.
  2. Signer returns the signature bytes.
  3. recovered.addSignature(signatureBytes)
  4. provider.sendRawTransaction(recovered)
The full nodejs example is in nodejs/send-klv-transfer/.
`)
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err)
  process.exit(1)
})
