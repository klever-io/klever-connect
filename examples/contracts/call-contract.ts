/**
 * Smart Contract Interaction Example
 *
 * Demonstrates how to:
 * 1. Load a contract ABI from the build artifact
 * 2. Call a mutable function — sends a transaction
 * 3. Call a payable function — sends KLV alongside the call
 *
 * The example targets the HelloWorld contract deployed via deploy-contract.ts.
 * Replace CONTRACT_ADDRESS and ABI_PATH / hello-world.abi.json with your own contract.
 */

import 'dotenv/config'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { KleverProvider } from '@klever/connect-provider'
import { NodeWallet } from '@klever/connect-wallet'
import { Contract } from '@klever/connect-contracts'
import type { ContractABI } from '@klever/connect-contracts'

const CONTRACT_ADDRESS = process.env['CONTRACT_ADDRESS']
if (!CONTRACT_ADDRESS) {
  console.error('Set CONTRACT_ADDRESS environment variable to the deployed contract address')
  process.exit(1)
}

// Load ABI from the built artifact next to this file
const __dirname = dirname(fileURLToPath(import.meta.url))
const abiPath = process.env['ABI_PATH'] ?? join(__dirname, 'hello-world.abi.json')

let ABI: ContractABI
try {
  ABI = JSON.parse(readFileSync(abiPath, 'utf-8')) as ContractABI
} catch {
  console.error(
    `Could not load ABI from ${abiPath}. Set ABI_PATH or place hello-world.abi.json next to this file.`,
  )
  process.exit(1)
}

async function main(): Promise<void> {
  const privateKey = process.env['PRIVATE_KEY']
  if (!privateKey) {
    throw new Error('Set PRIVATE_KEY environment variable')
  }

  const provider = new KleverProvider({ network: 'testnet' })
  const wallet = new NodeWallet(provider, privateKey)
  await wallet.connect()

  // Create a Contract instance (signer enables mutable calls)
  const contract = new Contract(CONTRACT_ADDRESS, ABI, wallet)

  // ── Mutable call — get_message ─────────────────────────────────────────
  const msgResult = await contract.invoke('get_message')
  console.log('get_message tx hash:', msgResult.hash)

  // ── Payable call — pay_hello ───────────────────────────────────────────
  // Sends KLV alongside the call via CallOptions { value: { KLV: amount } }.
  // This contract checks: require!(klv_value() == BigUint::from(10u8))
  const payResult = await contract.invoke('pay_hello', { value: { KLV: 10n } })
  console.log('pay_hello tx hash:', payResult.hash)

  await wallet.disconnect(true)
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err)
  process.exit(1)
})
