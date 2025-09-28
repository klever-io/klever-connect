import { KleverProvider } from '@klever/connect-provider'
import type { KleverAddress } from '@klever/connect-core'

export class Klever {
  private provider: KleverProvider

  constructor(options: { network: string }) {
    this.provider = new KleverProvider(options.network)
  }

  async getBalance(address: string): Promise<bigint> {
    return this.provider.getBalance(address as KleverAddress)
  }
}
