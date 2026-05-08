/**
 * Example: kda-add-role (Flow 31)
 *
 * Grants mint and/or set-ito-prices roles to another address. Only the asset
 * owner can call this, and only when the asset was created with `canAddRoles: true`.
 *
 * SDK call
 * --------
 * `wallet.sendTransaction({ contractType: 11, triggerType: 6, assetId, role: {...} })`
 *   - contractType 11 = TXType.AssetTrigger
 *   - triggerType 6   = AddRole
 *   - role = {
 *       address:           bech32 of the grantee
 *       hasRoleMint:       true grants mint authority
 *       hasRoleSetITOPrices: true grants ITO-price-setting authority
 *     }
 *
 * Note: Burn is NOT a separate role — burn capability is granted alongside Mint
 * by convention. To revoke roles, use triggerType 7 (RemoveRole).
 */

import 'node:process'

import { KleverProvider, NodeWallet, ValidationError, isValidAddress } from '@klever/connect'

const NETWORK = (process.env['KLV_NETWORK'] ?? 'testnet') as 'mainnet' | 'testnet' | 'devnet'
const PRIVATE_KEY = process.env['KLV_PRIVATE_KEY']
const KDA_ID = process.env['KLV_KDA_ID']
const ROLE_ADDRESS = process.env['KLV_ROLE_ADDRESS']
const HAS_MINT = (process.env['KLV_ROLE_MINT'] ?? '1') === '1'
const HAS_ITO = (process.env['KLV_ROLE_SET_ITO_PRICES'] ?? '0') === '1'

if (!PRIVATE_KEY) {
  console.error('Error: KLV_PRIVATE_KEY is required.')
  process.exit(1)
}
if (!KDA_ID || !ROLE_ADDRESS) {
  console.error('Error: KLV_KDA_ID and KLV_ROLE_ADDRESS are required.')
  process.exit(1)
}

async function main(): Promise<void> {
  const provider = new KleverProvider({ network: NETWORK })
  const wallet = new NodeWallet(provider, PRIVATE_KEY as string)
  await wallet.connect()
  console.log(`Owner: ${wallet.address}`)

  try {
    if (!isValidAddress(ROLE_ADDRESS as string)) {
      throw new ValidationError(`Invalid role recipient: ${ROLE_ADDRESS}`)
    }
    console.log(
      `Granting role on ${KDA_ID} to ${ROLE_ADDRESS}: mint=${HAS_MINT} setITOPrices=${HAS_ITO}`,
    )

    const result = await wallet.sendTransaction({
      contractType: 11, // TXType.AssetTrigger
      triggerType: 6, // AddRole
      assetId: KDA_ID as string,
      role: {
        address: ROLE_ADDRESS as string,
        hasRoleMint: HAS_MINT,
        hasRoleSetITOPrices: HAS_ITO,
      },
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
  console.error('kda-add-role failed:', err instanceof Error ? err.message : err)
  process.exit(1)
})
