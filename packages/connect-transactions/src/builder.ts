import type { TransactionRequest } from '@klever/connect-core'

export class TransactionBuilder {
  build(_request: TransactionRequest): Uint8Array {
    return new Uint8Array()
  }
}
