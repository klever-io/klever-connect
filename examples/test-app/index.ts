import { Klever } from '@klever/connect'
import { formatKLV, parseKLV } from '@klever/connect-helpers'
import type { KleverAddress } from '@klever/connect-core'

async function main(): Promise<void> {
  console.log('Testing Klever Connect SDK...\n')

  // Initialize the SDK
  const klever = new Klever({ network: 'testnet' })
  console.log('✅ SDK initialized with testnet')

  // Test address validation
  const testAddress = 'klv1test...' as KleverAddress
  console.log('📍 Test address:', testAddress)

  // Test balance query (will return 0 as it's a placeholder)
  const balance = await klever.getBalance(testAddress)
  console.log('💰 Balance:', formatKLV(balance), 'KLV')

  // Test amount parsing
  const amount = parseKLV('100.5')
  console.log('🔢 Parsed 100.5 KLV to:', amount.toString(), 'units')

  // Test formatted amount
  const formatted = formatKLV(1505000n)
  console.log('📊 Formatted 1505000 units to:', formatted, 'KLV')
}

main().catch(console.error)