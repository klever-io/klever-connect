/**
 * Flow #11 — balance-read
 *
 * The "hello world" of read-only Klever interactions: fetch the KLV balance
 * of any address (no wallet, no signing). Optionally also fetch a specific
 * KDA token balance.
 *
 * Read paths used:
 *   - `provider.getBalance(address)`           -> bigint smallest units of KLV
 *   - `provider.getBalance(address, assetId)`  -> bigint smallest units of a KDA
 */

import {
  KleverProvider,
  formatKLV,
  createKleverAddress,
  isValidAddress,
} from '@klever/connect'

async function main(): Promise<void> {
  const network = (process.env['KLV_NETWORK'] ?? 'testnet') as
    | 'mainnet' | 'testnet' | 'devnet' | 'local'
  const provider = new KleverProvider({ network })

  const rawAddress = process.env['KLEVER_ADDRESS'] ??
    'klv1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqpgm89z'

  // Validate before passing to the provider — protects against accidentally
  // querying with a typo.
  if (!isValidAddress(rawAddress)) {
    throw new Error(`Invalid Klever address: ${rawAddress}`)
  }
  const address = createKleverAddress(rawAddress)

  console.log(`Network : ${network}`)
  console.log(`Address : ${address}\n`)

  // --- KLV balance -----------------------------------------------------------
  // Returns a bigint of smallest units. Format with `formatKLV` for display.
  const klvRaw = await provider.getBalance(address)
  console.log(`KLV balance (raw)    : ${klvRaw.toString()}`)
  console.log(`KLV balance (human)  : ${formatKLV(klvRaw)}`)

  // --- KDA balance (optional) ------------------------------------------------
  const kdaId = process.env['KDA_ID']
  if (kdaId) {
    const kdaRaw = await provider.getBalance(address, kdaId)
    console.log(`\n${kdaId} balance (raw)  : ${kdaRaw.toString()}`)
    console.log(
      `${kdaId} balance (human): not formatted automatically — fetch the asset's precision via getAccount() and use formatUnits().`,
    )
  } else {
    console.log('\n(KDA_ID not set — skipping KDA balance fetch)')
  }
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err)
  process.exit(1)
})
