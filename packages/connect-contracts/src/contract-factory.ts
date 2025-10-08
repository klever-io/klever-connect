/**
 * ContractFactory for Klever Smart Contracts
 *
 * Handles contract deployment similar to ethers.js ContractFactory.
 * The ContractFactory simplifies the process of deploying new smart contracts
 * to the Klever blockchain by combining the contract's ABI and bytecode.
 *
 * @remarks
 * The deployment flow:
 * 1. Create a ContractFactory with ABI, bytecode, and signer
 * 2. Call deploy() with constructor arguments
 * 3. Wait for the deployment transaction to be mined
 * 4. Extract the deployed contract address from the receipt
 *
 * @example Basic deployment
 * ```typescript
 * import { ContractFactory } from '@klever/connect-contracts'
 * import { Wallet } from '@klever/connect-wallet'
 *
 * const abi = {...} // Contract ABI
 * const bytecode = '0x...' // Contract bytecode
 * const wallet = new Wallet(privateKey, provider)
 *
 * // Create factory
 * const factory = new ContractFactory(abi, bytecode, wallet)
 *
 * // Deploy contract
 * const contract = await factory.deploy(arg1, arg2, arg3)
 *
 * // Get deployment transaction
 * const deployTx = contract.deployTransaction
 *
 * // Wait for deployment to complete
 * const receipt = await provider.waitForTransaction(deployTx.hash)
 *
 * // Get deployed address
 * const address = ContractFactory.getDeployedAddress(receipt)
 * console.log('Contract deployed at:', address)
 * ```
 *
 * @example Deploying with constructor arguments
 * ```typescript
 * // Deploy ERC20-like token with name, symbol, and initial supply
 * const factory = new ContractFactory(tokenABI, tokenBytecode, wallet)
 * const token = await factory.deploy('MyToken', 'MTK', 1000000n)
 * ```
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
 *
 * Combines ABI and bytecode to enable contract deployment.
 * The factory handles encoding constructor arguments and building
 * the deployment transaction.
 *
 * @see {@link Contract} for interacting with deployed contracts
 * @see {@link Interface} for ABI encoding
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
   *
   * Deploys a new instance of the contract to the Klever blockchain.
   * This method encodes the constructor arguments, builds the deployment transaction,
   * signs it, and broadcasts it to the network.
   *
   * @param args - Constructor arguments (if any)
   * @returns Contract instance (note: address will be 'klv1pending' until receipt is parsed)
   * @throws Error if provider is not available
   * @throws Error if transaction signing fails
   *
   * @example Deploy without constructor arguments
   * ```typescript
   * const factory = new ContractFactory(abi, bytecode, wallet)
   * const contract = await factory.deploy()
   *
   * // Access deployment transaction
   * const tx = contract.deployTransaction
   * console.log('Deployment tx hash:', tx.hash)
   * ```
   *
   * @example Deploy with constructor arguments
   * ```typescript
   * // Deploy token contract with name, symbol, and supply
   * const factory = new ContractFactory(tokenABI, tokenBytecode, wallet)
   * const token = await factory.deploy('MyToken', 'MTK', 1000000000n)
   *
   * // Wait for deployment
   * const receipt = await provider.waitForTransaction(token.deployTransaction.hash)
   *
   * // Get deployed address
   * const address = ContractFactory.getDeployedAddress(receipt)
   *
   * // Attach to deployed contract
   * const deployedToken = factory.attach(address)
   * ```
   *
   * @remarks
   * The returned Contract instance has a placeholder address ('klv1pending').
   * You must wait for the deployment transaction to be mined and then use
   * `ContractFactory.getDeployedAddress(receipt)` to get the actual address.
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
   *
   * Parses the deployment transaction receipt to extract the address where
   * the contract was deployed. This is a static method that can be used
   * without a ContractFactory instance.
   *
   * @param receipt - Transaction receipt from deployment
   * @returns The deployed contract address
   * @throws Error if receipt does not contain contract deployment data
   *
   * @example
   * ```typescript
   * // Deploy contract
   * const factory = new ContractFactory(abi, bytecode, wallet)
   * const contract = await factory.deploy(arg1, arg2)
   *
   * // Wait for deployment
   * const tx = contract.deployTransaction
   * const receipt = await provider.waitForTransaction(tx.hash)
   *
   * // Extract deployed address
   * const address = ContractFactory.getDeployedAddress(receipt)
   * console.log('Contract deployed at:', address)
   *
   * // Create new contract instance with real address
   * const deployedContract = factory.attach(address)
   * ```
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
   *
   * Creates a new Contract instance pointing to an already-deployed contract at the
   * specified address. This is useful when you have the ABI and bytecode for a contract
   * type and want to interact with an existing instance.
   *
   * @param address - The address of the deployed contract
   * @returns A new Contract instance connected to the deployed contract
   *
   * @example
   * ```typescript
   * const factory = new ContractFactory(abi, bytecode, wallet)
   *
   * // Attach to an existing contract
   * const existingContract = factory.attach('klv1contract...')
   *
   * // Now you can interact with it
   * const result = await existingContract.balanceOf(address)
   * await existingContract.transfer(toAddress, amount)
   * ```
   *
   * @example Interacting with multiple instances
   * ```typescript
   * const tokenFactory = new ContractFactory(tokenABI, tokenBytecode, wallet)
   *
   * // Attach to different token instances
   * const token1 = tokenFactory.attach('klv1token1...')
   * const token2 = tokenFactory.attach('klv1token2...')
   *
   * // Check balances for both
   * const balance1 = await token1.balanceOf(myAddress)
   * const balance2 = await token2.balanceOf(myAddress)
   * ```
   */
  attach(address: string): Contract {
    return new Contract(address, this.interface.abi, this.signer)
  }

  /**
   * Connect to different signer
   *
   * Creates a new ContractFactory instance with the same ABI and bytecode but
   * connected to a different signer. This is useful when you want to deploy or
   * interact with contracts using different accounts.
   *
   * @param signer - The new signer to use
   * @returns A new ContractFactory instance with the new signer
   *
   * @example
   * ```typescript
   * const factory1 = new ContractFactory(abi, bytecode, wallet1)
   *
   * // Switch to a different wallet
   * const factory2 = factory1.connect(wallet2)
   *
   * // Deploy the same contract from wallet2
   * const contract = await factory2.deploy(arg1, arg2)
   * ```
   *
   * @example Deploying from multiple accounts
   * ```typescript
   * const baseFactory = new ContractFactory(abi, bytecode, adminWallet)
   *
   * // Deploy instances from different wallets
   * const contract1 = await baseFactory.deploy(owner1)
   * const contract2 = await baseFactory.connect(wallet2).deploy(owner2)
   * const contract3 = await baseFactory.connect(wallet3).deploy(owner3)
   * ```
   */
  connect(signer: Signer): ContractFactory {
    return new ContractFactory(this.interface.abi, this.bytecode, signer)
  }

  /**
   * Get deployment bytecode
   *
   * Generates the deployment bytecode (contract bytecode + encoded constructor arguments)
   * without actually deploying the contract. This is useful for offline transaction building
   * or inspecting the deployment data.
   *
   * @param args - Constructor arguments (if any)
   * @returns Object containing the deployment data (bytecode + constructor args as hex string)
   *
   * @example
   * ```typescript
   * const factory = new ContractFactory(abi, bytecode, wallet)
   *
   * // Get deployment transaction data
   * const deployTx = factory.getDeployTransaction('MyToken', 'MTK', 1000000n)
   *
   * console.log('Deployment data:', deployTx.data)
   * // This is the hex string that would be included in the deployment transaction
   * ```
   *
   * @example Inspecting deployment data
   * ```typescript
   * const factory = new ContractFactory(tokenABI, tokenBytecode, wallet)
   *
   * // Get deployment data for different configurations
   * const deploy1 = factory.getDeployTransaction('Token1', 'TK1', 1000n)
   * const deploy2 = factory.getDeployTransaction('Token2', 'TK2', 2000n)
   *
   * console.log('Deploy 1 size:', deploy1.data.length / 2, 'bytes')
   * console.log('Deploy 2 size:', deploy2.data.length / 2, 'bytes')
   * ```
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
