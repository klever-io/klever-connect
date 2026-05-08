/**
 * Create KDA Asset Example
 *
 * Demonstrates how to create a new fungible KDA token on the Klever blockchain.
 *
 * KDA (Klever Digital Asset) is the standard for custom tokens on Klever.
 * After creation, the ticker is assigned an on-chain ID: TICKER-XXXX-N
 * where XXXX is a random hex suffix and N is the nonce.
 *
 * Token name rules: alphanumeric only (A-Z, a-z, 0-9) — no spaces or special characters.
 *
 * CreateAsset type values are available via AssetType from @klever/connect-encoding:
 *   AssetType.Fungible       (0) — standard token
 *   AssetType.NonFungible    (1) — NFT collection
 *   AssetType.SemiFungible   (2)
 */

import 'dotenv/config'
import { KleverProvider } from '@klever/connect-provider'
import { NodeWallet } from '@klever/connect-wallet'
import { parseKLV } from '@klever/connect-core'
import { AssetType } from '@klever/connect-encoding'

async function main(): Promise<void> {
  const privateKey = process.env['PRIVATE_KEY']
  if (!privateKey) {
    throw new Error('Set PRIVATE_KEY environment variable')
  }

  const provider = new KleverProvider({ network: 'testnet' })
  const wallet = new NodeWallet(provider, privateKey)
  await wallet.connect()

  try {
    console.log('Creator address:', wallet.address)

    // ── Create a fungible KDA token ──────────────────────────────────────────
    const result = await wallet.sendTransaction({
      contractType: 1, // TXType.CreateAsset
      type: AssetType.Fungible,
      name: 'MyTestToken', // alphanumeric only — no spaces or special chars
      ticker: 'MTT',
      ownerAddress: wallet.address,
      precision: 6, // 6 decimal places (like KLV)
      initialSupply: parseKLV('1000000'), // 1,000,000 MTT minted to owner
      maxSupply: parseKLV('10000000'), // 10,000,000 MTT hard cap
      properties: {
        canFreeze: true,
        canWipe: false,
        canPause: false,
        canMint: true, // allows minting more supply later
        canBurn: true, // allows burning tokens
        canChangeOwner: true,
        canAddRoles: true,
      },
      uris: {
        website: 'https://example.com',
        github: 'https://github.com/example',
      },
    })

    console.log('CreateAsset tx hash:', result.hash)
    console.log('Check the receipt to find your new KDA ID (TICKER-XXXX-N).')

    // ── Create an NFT collection ─────────────────────────────────────────────
    // Uncomment to also create an NFT collection
    //
    // const nftResult = await wallet.sendTransaction({
    //   contractType: 1, // TXType.CreateAsset
    //   type: AssetType.NonFungible,
    //   name: 'MyNFTCollection',   // alphanumeric only
    //   ticker: 'MNFT',
    //   ownerAddress: wallet.address,
    //   precision: 0,    // NFTs always use 0 decimals
    //   maxSupply: 10000,
    //   properties: {
    //     canMint: true,
    //     canBurn: true,
    //     canAddRoles: true,
    //   },
    //   uris: { website: 'https://mynft.example.com' },
    // })
    // console.log('CreateAsset (NFT) tx hash:', nftResult.hash)
  } finally {
    await wallet.disconnect(true)
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err)
  process.exit(1)
})
