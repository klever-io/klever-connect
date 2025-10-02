import type { Network } from '@klever/connect-provider'
import { KleverProvider } from '@klever/connect-provider'
import type { KleverAddress } from '@klever/connect-core'

export class Klever {
  private provider: KleverProvider

  constructor(options: { network: Network }) {
    this.provider = new KleverProvider(options)
  }

  async getBalance(address: string): Promise<bigint> {
    return this.provider.getBalance(address as KleverAddress)
  }
}
