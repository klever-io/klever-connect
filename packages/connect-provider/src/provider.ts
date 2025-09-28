import type { KleverAddress } from '@klever/connect-core'

export class KleverProvider {
  constructor(private url: string) {
    this.url = url
  }

  async getBalance(_address: KleverAddress): Promise<bigint> {
    // Placeholder implementation
    console.log(`Getting balance from ${this.url}`)
    return 0n
  }
}
