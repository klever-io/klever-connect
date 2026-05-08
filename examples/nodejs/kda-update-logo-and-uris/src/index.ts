/**
 * Example: kda-update-logo-and-uris (Flow 32)
 *
 * Updates an asset's logo and URI map. These are two distinct AssetTrigger calls:
 *
 *   triggerType 10 (UpdateLogo) — single string, the new logo URL/URI
 *   triggerType 11 (UpdateURIs) — full URI map; replaces the on-chain set
 *
 * The example sends both sequentially. If the second tx racing the first hits
 * the same nonce, await `result.wait()` between calls — we do.
 */

import 'node:process'

import { KleverProvider, NodeWallet } from '@klever/connect'

const NETWORK = (process.env['KLV_NETWORK'] ?? 'testnet') as 'mainnet' | 'testnet' | 'devnet'
const PRIVATE_KEY = process.env['KLV_PRIVATE_KEY']
const KDA_ID = process.env['KLV_KDA_ID']
const LOGO = process.env['KLV_KDA_LOGO'] ?? ''
const URIS_RAW = process.env['KLV_KDA_URIS'] ?? '{}'

if (!PRIVATE_KEY) {
  console.error('Error: KLV_PRIVATE_KEY is required.')
  process.exit(1)
}
if (!KDA_ID) {
  console.error('Error: KLV_KDA_ID is required.')
  process.exit(1)
}

let parsedUris: Record<string, string>
try {
  parsedUris = JSON.parse(URIS_RAW) as Record<string, string>
} catch (err) {
  console.error(`Invalid KLV_KDA_URIS JSON: ${(err as Error).message}`)
  process.exit(1)
}

async function main(): Promise<void> {
  const provider = new KleverProvider({ network: NETWORK })
  const wallet = new NodeWallet(provider, PRIVATE_KEY as string)
  await wallet.connect()
  console.log(`Owner: ${wallet.address}`)

  try {
    // ---------------- UpdateLogo (triggerType 10) -----------------
    if (LOGO) {
      console.log(`UpdateLogo on ${KDA_ID} -> ${LOGO}`)
      const r1 = await wallet.sendTransaction({
        contractType: 11, // TXType.AssetTrigger
        triggerType: 10, // UpdateLogo
        assetId: KDA_ID as string,
        logo: LOGO,
      })
      console.log(`  hash=${r1.hash}`)
      // Await confirmation before issuing the next call so we don't reuse the nonce.
      if (r1.wait) {
        const c1 = await r1.wait()
        console.log(`  confirmed=${c1.status}`)
      }
    } else {
      console.log('Skipping UpdateLogo (KLV_KDA_LOGO empty).')
    }

    // ---------------- UpdateURIs (triggerType 11) -----------------
    if (Object.keys(parsedUris).length > 0) {
      console.log(`UpdateURIs on ${KDA_ID} -> ${JSON.stringify(parsedUris)}`)
      const r2 = await wallet.sendTransaction({
        contractType: 11, // TXType.AssetTrigger
        triggerType: 11, // UpdateURIs
        assetId: KDA_ID as string,
        uris: parsedUris,
      })
      console.log(`  hash=${r2.hash}`)
      if (r2.wait) {
        const c2 = await r2.wait()
        console.log(`  confirmed=${c2.status}`)
      }
    } else {
      console.log('Skipping UpdateURIs (KLV_KDA_URIS is empty).')
    }
  } finally {
    await wallet.disconnect(true)
  }
}

main().catch((err) => {
  console.error('kda-update-logo-and-uris failed:', err instanceof Error ? err.message : err)
  process.exit(1)
})
