import { detectEnvironment } from '@klever/connect-core'
import type { IProvider } from '@klever/connect-provider'
import { KleverProvider } from '@klever/connect-provider'

import { BrowserWallet } from './browser'
import { NodeWallet } from './node'
import type { Wallet, WalletConfig, WalletFactory as IWalletFactory } from './types'

export class WalletFactory implements IWalletFactory {
  private provider: IProvider

  constructor(provider?: IProvider) {
    this.provider = provider || new KleverProvider()
  }

  async createWallet(config?: WalletConfig): Promise<Wallet> {
    const environment = detectEnvironment()

    // Allow overriding the provider
    if (config?.provider) {
      this.provider = config.provider
    } else if (config?.network) {
      this.provider = new KleverProvider({
        network: config.network,
      })
    }

    switch (environment) {
      case 'browser':
        return this.createBrowserWallet()

      case 'node':
        return this.createNodeWallet(config?.privateKey)

      case 'react-native':
        // TODO: Implement React Native wallet
        throw new Error('React Native wallet not implemented yet')

      default:
        throw new Error(`Unsupported environment: ${environment}`)
    }
  }

  private createBrowserWallet(): BrowserWallet {
    return new BrowserWallet(this.provider)
  }

  private createNodeWallet(privateKey?: string): NodeWallet {
    if (!privateKey) {
      throw new Error('Private key is required for Node.js environment')
    }
    return new NodeWallet(this.provider, privateKey)
  }
}

// Convenience function for creating wallets
export async function createWallet(config?: WalletConfig): Promise<Wallet> {
  const factory = new WalletFactory()
  return factory.createWallet(config)
}

// Export specific wallet types for advanced users
export { BrowserWallet, NodeWallet }
