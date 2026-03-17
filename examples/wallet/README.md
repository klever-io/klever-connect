# Wallet Examples

Creating, recovering, and managing Klever wallets in Node.js.

## Examples

### `create-wallet.ts` — Wallet creation

Three approaches: from private key, random generation, or WalletFactory (auto-detects environment).

```bash
PRIVATE_KEY=your_hex_key npx tsx create-wallet.ts
```

### `mnemonic.ts` — HD wallet with BIP39 mnemonic

Generate a 12 or 24-word mnemonic, validate it, and derive multiple accounts from the same seed.

```bash
npx tsx mnemonic.ts
```

### `keystore.ts` — Encrypted keystore

Generate a wallet, encrypt it to a JSON keystore file, and restore it from disk with a password.

```bash
KEYSTORE_PASSWORD=my-secret npx tsx keystore.ts
```

### `sign-message.ts` — Message signing and verification

Sign arbitrary messages or raw bytes and verify signatures using the wallet's public key.

```bash
PRIVATE_KEY=your_hex_key npx tsx sign-message.ts
```

## Key Concepts

### Wallet types

| Type            | Environment | Use case                            |
| --------------- | ----------- | ----------------------------------- |
| `NodeWallet`    | Node.js     | Scripts, backends, CLI tools        |
| `BrowserWallet` | Browser     | dApps using browser extensions      |
| `WalletFactory` | Both        | Write-once code that works anywhere |

### HD wallet derivation path

Klever uses BIP44 with coin type `690`:

```
m / 44' / 690' / account' / change' / index'
```

Default: `m/44'/690'/0'/0'/0'`

### Keystore security

- Use a strong password (mixed chars, numbers, symbols)
- Default `scryptN: 262144` — most secure but slow (~seconds)
- Use `scryptN: 4096` only for testing/development
- Never store the password next to the keystore file

### Private key security

Always:

- Load from environment variables, never hardcode
- Call `wallet.disconnect(true)` to clear from memory when done
- Use keystores for long-term storage
