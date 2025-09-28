import { Wallet } from './wallet'

export class NodeWallet extends Wallet {
  static fromMnemonic(_mnemonic: string): NodeWallet {
    return new NodeWallet('')
  }
}
