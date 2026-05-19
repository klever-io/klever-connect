/**
 * Flow #3 — format-parse-klv
 *
 * KLV has 6 decimals. The blockchain stores balances as bigint smallest units
 * (a value `12_345_678n` means `12.345678 KLV`). The SDK exposes:
 *
 *   - parseKLV('12.345678')  -> 12345678n         (string -> smallest units)
 *   - formatKLV(12345678n)   -> '12.345678'       (smallest units -> string)
 *   - parseUnits / formatUnits  for arbitrary precisions (see flow #4)
 *
 * Always use bigint for balance math — never `number`. JavaScript's number is
 * a 64-bit double and quietly loses precision past ~9 quadrillion smallest
 * units (~9 billion KLV).
 */

import { parseKLV, formatKLV } from '@klever/connect'

function demo(amount: string): void {
  const smallestUnits = parseKLV(amount)
  const back = formatKLV(smallestUnits)

  console.log(`  ${amount.padStart(20)} KLV -> ${smallestUnits.toString().padStart(24)} smallest units -> ${back}`)
}

async function main(): Promise<void> {
  console.log('parseKLV / formatKLV (6-decimal precision)\n')

  demo('1')
  demo('1.5')
  demo('12.345678')
  demo('0.000001')           // 1 smallest unit (the dust limit for KLV)
  demo('1000000000')         // 1 billion KLV — well within safe bigint range
  demo('0')

  // Whatever the user supplies via env:
  const userAmount = process.env['KLV_AMOUNT']
  if (userAmount) {
    console.log(`\nUser-supplied amount:`)
    demo(userAmount)
  }

  // ---------------------------------------------------------------------------
  // Common pitfall: passing a number instead of a string.
  // parseKLV expects a string. Passing 1.1 (a number) is technically allowed
  // by some overloads but loses precision because the SDK has to call
  // .toString() under the hood — and 1.1.toString() === '1.1' but
  // 0.1 + 0.2 === 0.30000000000000004. Stick to strings.
  // ---------------------------------------------------------------------------
  console.log('\nWhy you should pass strings:')
  console.log('  parseKLV("0.30000000000000004") =', parseKLV('0.30000000000000004').toString())
  console.log('  Always use bigint for math:')
  const a = parseKLV('1.5')
  const b = parseKLV('2.7')
  console.log(`  ${formatKLV(a)} + ${formatKLV(b)} = ${formatKLV(a + b)}`)

  console.log('\nDone.')
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err)
  process.exit(1)
})
