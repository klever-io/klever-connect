/**
 * Flow #4 — format-parse-kda
 *
 * KDA tokens have arbitrary precisions:
 *   - KLV / KFI                       6 decimals
 *   - typical USDT-style stablecoins  8 decimals (depends on issuer)
 *   - NFTs                            0 decimals (whole units only)
 *
 * The SDK exposes precision-aware helpers:
 *   - parseUnits(value, decimals)      string -> bigint smallest units
 *   - formatUnits(value, decimals)     bigint -> string
 *   - parseAssetAmount(value, decimals) -> branded AssetAmount
 *   - formatAssetAmount(value, decimals)
 *
 * KLV uses precision 6 — `parseUnits('1', 6) === parseKLV('1')` (use either,
 * they round-trip identically).
 *
 * IMPORTANT: you must know the token's precision to format correctly. The SDK
 * does NOT auto-discover it from the asset id. Fetch precision once via
 * `provider.getAccount(addr)` (which lists per-asset precisions) and cache it.
 */

import { parseUnits, formatUnits, parseAssetAmount, formatAssetAmount } from '@klever/connect'

interface KDA {
  symbol: string
  precision: number
  amount: string
}

const SAMPLES: KDA[] = [
  { symbol: 'KLV', precision: 6, amount: '12.345678' },
  { symbol: 'USDT-stable', precision: 8, amount: '1000.50000000' },
  { symbol: 'NFT-id', precision: 0, amount: '1' },
  { symbol: 'high-prec', precision: 18, amount: '0.000000000000000001' }, // 1 wei-style
]

function demo(k: KDA): void {
  // parseUnits / formatUnits return / accept plain bigints.
  const smallest = parseUnits(k.amount, k.precision)
  const back = formatUnits(smallest, k.precision)

  // parseAssetAmount / formatAssetAmount add a `AssetAmount` brand on top —
  // useful when the value flows into typed APIs (e.g. transfer requests).
  const branded = parseAssetAmount(k.amount, k.precision)
  const brandedBack = formatAssetAmount(branded, k.precision)

  console.log(
    `  ${k.symbol.padStart(12)} (p=${k.precision}): ${k.amount.padStart(28)} -> ${smallest.toString().padStart(28)} -> ${back}  (branded: ${brandedBack})`,
  )
}

async function main(): Promise<void> {
  console.log('parseUnits / formatUnits — arbitrary-precision KDA conversion\n')

  for (const sample of SAMPLES) demo(sample)

  // ---------------------------------------------------------------------------
  // User-supplied amount + precision
  // ---------------------------------------------------------------------------
  const userAmount = process.env['KDA_AMOUNT']
  const userPrec = process.env['KDA_PRECISION']
  if (userAmount && userPrec) {
    console.log('\nUser-supplied:')
    demo({
      symbol: 'user',
      precision: Number.parseInt(userPrec, 10),
      amount: userAmount,
    })
  }

  // ---------------------------------------------------------------------------
  // Cross-precision math is dangerous — never add bigints with different
  // precisions without normalising. The SDK does not protect you here.
  // ---------------------------------------------------------------------------
  console.log('\nCross-precision pitfall:')
  const klvAmount = parseUnits('1', 6) // 1_000_000n
  const usdtAmount = parseUnits('1', 8) // 100_000_000n
  console.log(`  parseUnits('1', 6) = ${klvAmount.toString()}`)
  console.log(`  parseUnits('1', 8) = ${usdtAmount.toString()}`)
  console.log(`  Adding them yields a meaningless number: ${(klvAmount + usdtAmount).toString()}`)
  console.log('  Always compare/add bigints of the SAME precision.')

  console.log('\nDone.')
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err)
  process.exit(1)
})
