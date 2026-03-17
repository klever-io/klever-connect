/**
 * Contract Deployment Example
 *
 * Demonstrates how to deploy a compiled Klever smart contract:
 * 1. Load ABI and bytecode from the build output
 * 2. Create a ContractFactory
 * 3. Deploy (with optional metadata overrides)
 * 4. Retrieve the deployed contract address from the receipt
 *
 * Compile your contract first:
 *   cd your-contract && ksc build
 * This produces:
 *   output/your_contract.wasm      ← bytecode
 *   output/your_contract.abi.json  ← ABI
 *
 * Then set in your .env:
 *   WASM_PATH=./contracts/hello-world.wasm
 *   ABI_PATH=./contracts/hello-world.abi.json
 */

import 'dotenv/config'
import { readFileSync, existsSync } from 'fs'
import { KleverProvider } from '@klever/connect-provider'
import { NodeWallet } from '@klever/connect-wallet'
import { ContractFactory } from '@klever/connect-contracts'
import type { ContractABI, Contract } from '@klever/connect-contracts'
import { hexEncode } from '@klever/connect-encoding'

async function main(): Promise<void> {
  const privateKey = process.env['PRIVATE_KEY']
  if (!privateKey) {
    throw new Error('Set PRIVATE_KEY environment variable')
  }

  const wasmPath = process.env['WASM_PATH'] ?? './contracts/hello-world.wasm'
  const abiPath = process.env['ABI_PATH'] ?? './contracts/hello-world.abi.json'

  if (!existsSync(wasmPath) || !existsSync(abiPath)) {
    throw new Error(
      `Contract files not found.\n  WASM: ${wasmPath}\n  ABI:  ${abiPath}\n` +
        'Build your contract with `ksc build` and set WASM_PATH / ABI_PATH in .env.',
    )
  }

  const bytecode = hexEncode(readFileSync(wasmPath))
  const abi = JSON.parse(readFileSync(abiPath, 'utf-8')) as ContractABI

  const provider = new KleverProvider({ network: 'testnet' })
  const wallet = new NodeWallet(provider, privateKey)
  await wallet.connect()

  console.log('Deployer:', wallet.address)

  // Create the factory with ABI, bytecode, and a signer.
  // You can set default metadata flags here (all default to true):
  //   new ContractFactory(abi, bytecode, wallet, { upgradeable: false })
  const factory = new ContractFactory(abi, bytecode, wallet)

  // Deploy the contract.
  // Pass constructor args first (if your init() takes parameters), then optional metadata overrides:
  //   await factory.deploy(initialValue)
  //   await factory.deploy({ metadata: { upgradeable: false } })
  console.log('Deploying contract...')
  const deployed = await factory.deploy()

  // deployTransaction is attached by ContractFactory after broadcast
  const { hash } = (deployed as Contract & { deployTransaction: { hash: string } })
    .deployTransaction
  console.log('Deploy tx hash:', hash)

  // The contract address is only assigned after the tx is confirmed on-chain.
  // Once waitForTransaction is available in the provider:
  //
  //   const receipt = await provider.waitForTransaction(hash)
  //   const address = ContractFactory.getDeployedAddress(receipt)
  //   console.log('Contract deployed at:', address)
  //
  // For now, check the explorer:
  console.log(`Explorer: https://kleverscan.org/transaction/${hash}`)

  await wallet.disconnect(true)
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err)
  process.exit(1)
})
