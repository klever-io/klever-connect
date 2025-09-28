import type { KleverAddress } from '@klever/connect-core'

export class KleverProvider {
  constructor(private url: string) {
    this.url = url
  }

  getBalance(_address: KleverAddress): Promise<bigint> {
    // Placeholder implementation - will use await when implementing actual API call
    console.log(`Getting balance from ${this.url}`)
    return Promise.resolve(0n)
  }
}
