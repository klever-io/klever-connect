import { Klever } from '@klever/connect'
import { formatKLV, parseKLV } from '@klever/connect-helpers'
import type { KleverAddress } from '@klever/connect-core'

// Example usage of the Klever Connect SDK

async function main() {
  // Initialize the SDK
  const klever = new Klever({ network: 'mainnet' })

  // Example address (placeholder)
  const address = 'klv1abc123...' as KleverAddress

  // Get balance
  const balance = await klever.getBalance(address)
  console.log('Balance:', formatKLV(balance), 'KLV')

  // Parse amount
  const amount = parseKLV('100.5')
  console.log('Parsed amount:', amount, 'units')
}

// Run the example
main().catch(console.error)