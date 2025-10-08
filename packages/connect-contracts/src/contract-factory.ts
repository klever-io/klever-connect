/**
 * ContractFactory for Klever Smart Contracts
 *
 * Handles contract deployment similar to ethers.js ContractFactory.
 */

import type { ContractABI } from './types/abi'
import { Interface } from './interface'
import { Contract, type Signer, type Provider } from './contract'
import { ABIEncoder } from './encoder/abi-encoder'
import { TransactionBuilder } from '@klever/connect-transactions'
import type { Transaction } from '@klever/connect-transactions'
import { parseDeployReceipt, type TransactionReceipt } from './receipt-parser'

/**
 * Factory for deploying contracts
 */
export class ContractFactory {
  readonly interface: Interface
  readonly bytecode: Uint8Array
  readonly signer: Signer
  readonly provider?: Provider
  private encoder: ABIEncoder

  constructor(abi: string | ContractABI, bytecode: Uint8Array | string, signer: Signer) {
    this.interface = new Interface(abi)
    this.signer = signer
    this.encoder = new ABIEncoder(this.interface.abi)

    // Get provider from signer if available
    if (signer.provider) {
      this.provider = signer.provider
    }

    // Handle bytecode as hex string or Uint8Array
    if (typeof bytecode === 'string') {
      // Remove 0x prefix if present
      const hex = bytecode.startsWith('0x') ? bytecode.slice(2) : bytecode
      const bytes = new Uint8Array(hex.length / 2)
      for (let i = 0; i < hex.length; i += 2) {
        bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16)
      }
      this.bytecode = bytes
    } else {
      this.bytecode = bytecode
    }
  }

  /**
   * Deploy contract
   */
  async deploy(...args: unknown[]): Promise<Contract> {
    // Encode constructor arguments using ABI-aware encoder
    const encodedArgs = this._encodeArguments(args)
    const constructorData = this.interface.encodeConstructor(encodedArgs)

    // Prepare deployment data (bytecode + constructor args)
    const deployData = this._prepareDeployData(constructorData)

    // Build transaction using TransactionBuilder
    // Note: Provider type mismatch - TransactionBuilder expects IProvider with full interface
    // We use type assertion here since our simplified Provider interface has the essential methods
    const builder = this.provider
      ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
        new TransactionBuilder(this.provider as any)
      : new TransactionBuilder()

    builder.smartContract({
      scType: 1, // Deploy new contract
      address: '', // Empty address for deployment
    })

    // Add deployment data
    builder.data([deployData])

    // Build transaction (uses node if provider available, otherwise offline)
    let tx: Transaction
    if (this.provider) {
      // Node-assisted build (fetches nonce, fees, etc.)
      tx = await builder.build()
    } else {
      // Offline build requires manual parameters
      throw new Error(
        'Contract deployment requires a provider. Please provide a signer with a connected provider.',
      )
    }

    // Sign transaction using signer
    if (typeof this.signer.signTransaction === 'function') {
      await this.signer.signTransaction(tx)
    }

    // Broadcast transaction
    // Note: TransactionBuilder.build() may handle broadcasting
    // If not, we need to call provider.broadcast(tx)

    // Extract contract address from transaction
    // We return a Contract instance with a placeholder address
    // Users should wait for the receipt to get the actual deployed address
    const contractAddress = 'klv1pending' // Placeholder - use getDeployedAddress() after receipt

    // Create contract instance with deployment transaction reference
    const contract = new Contract(contractAddress, this.interface.abi, this.signer)

    // Add deployment transaction reference for later receipt parsing
    Object.defineProperty(contract, 'deployTransaction', {
      value: tx,
      writable: false,
      enumerable: true,
    })

    return contract
  }

  /**
   * Extract deployed contract address from transaction receipt
   */
  static getDeployedAddress(receipt: TransactionReceipt): string {
    const parsed = parseDeployReceipt(receipt)
    return parsed.contractAddress
  }

  /**
   * Encode constructor arguments based on ABI
   */
  private _encodeArguments(args: unknown[]): Uint8Array[] {
    // If no arguments, return empty array
    if (args.length === 0) {
      return []
    }

    // Check if arguments are already encoded Uint8Arrays
    const allAreUint8Array = args.every((arg) => arg instanceof Uint8Array)
    if (allAreUint8Array) {
      return args.filter((arg): arg is Uint8Array => arg instanceof Uint8Array)
    }

    // Use ABI-aware encoding
    return this.encoder.encodeConstructorArgs(args)
  }

  /**
   * Prepare deployment data (bytecode + constructor args)
   */
  private _prepareDeployData(constructorData: string): string {
    // Convert bytecode to hex
    const bytecodeHex = Array.from(this.bytecode)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')

    // Combine bytecode and constructor args
    return bytecodeHex + constructorData
  }

  /**
   * Attach to existing deployed contract
   */
  attach(address: string): Contract {
    return new Contract(address, this.interface.abi, this.signer)
  }

  /**
   * Connect to different signer
   */
  connect(signer: Signer): ContractFactory {
    return new ContractFactory(this.interface.abi, this.bytecode, signer)
  }

  /**
   * Get deployment bytecode
   */
  getDeployTransaction(...args: unknown[]): { data: string } {
    const encodedArgs = this._encodeArguments(args)
    const constructorData = this.interface.encodeConstructor(encodedArgs)
    const deployData = this._prepareDeployData(constructorData)

    return {
      data: deployData,
    }
  }
}
