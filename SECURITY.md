# Security Policy

## Reporting Security Vulnerabilities

**Please DO NOT open public issues for security vulnerabilities.**

If you discover a security vulnerability in Klever Connect SDK, please report it responsibly:

1. **Email**: security@klever.io
2. **Subject**: [SECURITY] Klever Connect SDK - Brief description
3. **Include**:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

We will acknowledge your email within 48 hours and provide a detailed response within 7 days.

---

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

---

## Security Best Practices

### 🔐 Private Key Management

#### ❌ NEVER DO THIS

```typescript
// NEVER hardcode private keys
const PRIVATE_KEY = 'abc123...' // DANGEROUS!

// NEVER store keys in version control
const wallet = new Wallet('hardcoded-key') // INSECURE!

// NEVER store keys in localStorage/sessionStorage (browser)
localStorage.setItem('privateKey', key) // VULNERABLE TO XSS!

// NEVER log private keys
console.log('Private key:', privateKey) // EXPOSES SECRETS!

// NEVER commit .env files with keys
// ❌ .env file in git repository

// NEVER pass keys in URLs
fetch(`https://api.example.com?key=${privateKey}`) // INSECURE!
```

#### ✅ DO THIS INSTEAD

**Node.js / Server Applications:**

```typescript
import { PrivateKeyImpl } from '@klever/connect-crypto'
import { NodeWallet } from '@klever/connect-wallet'

// Use environment variables
const privateKey = PrivateKeyImpl.fromHex(process.env.PRIVATE_KEY!)
const wallet = new NodeWallet(privateKey)

// Or load from encrypted PEM file
import { loadPrivateKeyFromPemFile } from '@klever/connect-crypto'
const privateKey2 = loadPrivateKeyFromPemFile('./wallet.pem', process.env.PEM_PASSWORD)
```

**Browser / Frontend Applications:**

```typescript
import { BrowserWallet } from '@klever/connect-wallet'

// Use browser extension (RECOMMENDED)
const wallet = await BrowserWallet.connect()

// For temporary operations, generate keys in-memory
import { generateKeyPair } from '@klever/connect-crypto'
const keyPair = await generateKeyPair()
// Use immediately, don't persist
```

**React Native / Mobile Applications:**

```typescript
import * as SecureStore from 'expo-secure-store'
import { PrivateKeyImpl } from '@klever/connect-crypto'

// Store encrypted in secure storage
async function saveKey(privateKey: PrivateKey) {
  const hex = privateKey.toHex()
  await SecureStore.setItemAsync('wallet_key', hex)
}

// Load from secure storage
async function loadKey(): Promise<PrivateKey> {
  const hex = await SecureStore.getItemAsync('wallet_key')
  if (!hex) throw new Error('No key found')
  return PrivateKeyImpl.fromHex(hex)
}
```

---

## Key Security Guidelines

### 1. Environment Variables (Node.js)

✅ **Best Practice**:

```bash
# .env (NOT committed to git)
PRIVATE_KEY=abc123...
PEM_PASSWORD=strongpassword123

# .env.example (committed to git)
PRIVATE_KEY=your-private-key-here
PEM_PASSWORD=your-pem-password-here
```

```typescript
// Load safely
import 'dotenv/config'
const privateKey = process.env.PRIVATE_KEY

// Validate
if (!privateKey) {
  throw new Error('PRIVATE_KEY environment variable not set')
}
```

### 2. PEM File Encryption

✅ **Best Practice**:

```typescript
import { loadPrivateKeyFromPemFile } from '@klever/connect-crypto'

// Always use encrypted PEM files
const privateKey = loadPrivateKeyFromPemFile('./wallet.pem', password)

// Generate encrypted PEM (example)
// Use Klever CLI or other tools to generate encrypted PEM files
```

**PEM File Security:**

- ✅ Use strong passwords (16+ characters, mixed case, numbers, symbols)
- ✅ Store PEM files with restricted permissions (chmod 600)
- ✅ Never commit PEM files to version control
- ✅ Use different passwords for different environments
- ✅ Rotate passwords periodically

### 3. Hardware Wallets (High-Value Operations)

For production systems handling significant value:

```typescript
// Use hardware wallet integration (when available)
import { LedgerWallet } from '@klever/connect-wallet' // Future implementation

const wallet = await LedgerWallet.connect()
const tx = await wallet.signTransaction(transaction)
```

### 4. Key Rotation

Implement key rotation for long-running services:

```typescript
// Example key rotation strategy
interface KeyRotationPolicy {
  rotateAfterDays: number
  warnBeforeDays: number
}

function shouldRotateKey(keyCreatedAt: Date, policy: KeyRotationPolicy): boolean {
  const daysSinceCreation = (Date.now() - keyCreatedAt.getTime()) / (1000 * 60 * 60 * 24)
  return daysSinceCreation >= policy.rotateAfterDays
}
```

### 5. Memory Security

Clear sensitive data from memory when done:

```typescript
import { PrivateKeyImpl } from '@klever/connect-crypto'

async function signAndClear(data: Uint8Array, privateKeyHex: string) {
  // Load key
  const privateKey = PrivateKeyImpl.fromHex(privateKeyHex)

  // Use key
  const signature = await signMessage(data, privateKey)

  // Clear key from memory (JavaScript limitation: can't guarantee)
  // But at least remove references
  privateKey.bytes.fill(0) // Zero out bytes
  delete (privateKey as any).bytes // Remove reference

  return signature
}
```

**Note**: JavaScript has limitations on secure memory management. For high-security applications, consider:

- Using hardware wallets
- Implementing key derivation on-demand
- Running signing operations in isolated processes

---

## Cryptographic Libraries

Klever Connect SDK uses **audited cryptographic libraries**:

### Dependencies

| Library                                                      | Purpose                           | Audit Status                |
| ------------------------------------------------------------ | --------------------------------- | --------------------------- |
| [@noble/ed25519](https://github.com/paulmillr/noble-ed25519) | Ed25519 signatures                | ✅ Audited by Trail of Bits |
| [@noble/hashes](https://github.com/paulmillr/noble-hashes)   | Hash functions (SHA-512, Blake2b) | ✅ Audited by Trail of Bits |
| [@scure/base](https://github.com/paulmillr/scure-base)       | Base encoding                     | ✅ Security reviewed        |
| [@scure/bip39](https://github.com/paulmillr/scure-bip39)     | BIP39 mnemonics                   | ✅ Security reviewed        |
| [protobufjs](https://github.com/protobufjs/protobuf.js)      | Protocol Buffers                  | ✅ Widely used, maintained  |

**Audit Reports**: See [audits/](./audits/) directory (when available)

---

## Transaction Security

### 1. Validate Transaction Parameters

```typescript
import { isKleverAddress } from '@klever/connect-core'

// Always validate addresses
if (!isKleverAddress(recipient)) {
  throw new Error('Invalid recipient address')
}

// Validate amounts
if (amount <= 0n) {
  throw new Error('Amount must be positive')
}

// Check balance before sending
const balance = await provider.getBalance(wallet.address)
if (balance < amount) {
  throw new Error('Insufficient balance')
}
```

### 2. Double-Check Transaction Details

```typescript
// Build transaction
const tx = await TransactionBuilder.create(provider)
  .sender(wallet.address)
  .transfer({
    receiver: recipient,
    amount: amount,
  })
  .build()

// Review transaction before signing
console.log('Transaction details:')
console.log('- From:', tx.sender)
console.log('- To:', tx.contracts[0].parameter.receiver)
console.log('- Amount:', tx.contracts[0].parameter.amount)
console.log('- Nonce:', tx.nonce)

// Confirm with user (if interactive)
const confirmed = await confirm('Sign this transaction?')
if (!confirmed) throw new Error('Transaction cancelled')

// Sign and broadcast
await wallet.signTransaction(tx)
const hash = await provider.sendRawTransaction(tx.toHex())
```

### 3. Simulate Transactions (Queries First)

For contract interactions, test with queries first:

```typescript
// Test readonly function first
const result = await contract.query('transfer', [recipient, amount])

// If successful, then invoke mutable function
const tx = await contract.invoke('transfer', [recipient, amount])
```

---

## Network Security

### 1. Use HTTPS Endpoints

```typescript
import { KleverProvider } from '@klever/connect-provider'

// ✅ HTTPS endpoint
const provider = new KleverProvider({
  network: {
    nodeUrl: 'https://api.mainnet.klever.org',
  },
})

// ❌ HTTP endpoint (insecure)
// const provider = new KleverProvider({
//   network: {
//     nodeUrl: 'http://api.mainnet.klever.org', // INSECURE!
//   },
// })
```

### 2. Verify Transaction Receipts

```typescript
// Always wait for confirmation
const tx = await wallet.sendTransaction({ to: recipient, value: amount })

// Wait for receipt
const receipt = await tx.wait()

// Verify status
if (receipt.status !== 'success') {
  console.error('Transaction failed:', receipt)
  throw new Error('Transaction execution failed')
}

// Verify transaction hash matches
const onChainTx = await provider.getTransaction(receipt.hash)
if (!onChainTx) {
  throw new Error('Transaction not found on chain')
}
```

### 3. Rate Limiting & DDoS Protection

For public-facing applications:

```typescript
// Implement rate limiting
const rateLimiter = new RateLimiter({
  maxRequests: 100,
  windowMs: 60000, // 1 minute
})

app.post('/api/transaction', rateLimiter.middleware, async (req, res) => {
  // Handle transaction
})
```

---

## Smart Contract Security

### 1. Validate ABI

```typescript
import { isValidABI } from '@klever/connect-contracts'

// Validate ABI before using
if (!isValidABI(abi)) {
  throw new Error('Invalid contract ABI')
}
```

### 2. Handle Contract Errors

```typescript
import { Contract, ContractReceiptError } from '@klever/connect-contracts'

try {
  const tx = await contract.invoke('transfer', [recipient, amount])
  const receipt = await tx.wait()

  // Check return code
  if (receipt.returnCode !== 'Ok') {
    console.error('Contract execution failed:', receipt.returnMessage)
  }
} catch (error) {
  if (error instanceof ContractReceiptError) {
    console.error('Contract error:', error.message)
    console.error('Return code:', error.returnCode)
    console.error('Gas used:', error.gasUsed)
  }
}
```

### 3. Test Contracts Thoroughly

```typescript
// Always test on testnet first
const testnetProvider = new KleverProvider('testnet')
const testnetContract = new Contract(testnetAddress, abi, testnetWallet)

// Test all functions
await testnetContract.query('balanceOf', [address])
await testnetContract.invoke('transfer', [recipient, smallAmount])

// Monitor gas usage
const receipt = await tx.wait()
console.log('Gas used:', receipt.gasUsed)

// Only deploy to mainnet after thorough testing
```

---

## Frontend Security (Browser/React)

### 1. Content Security Policy (CSP)

Add CSP headers to prevent XSS:

```html
<meta
  http-equiv="Content-Security-Policy"
  content="default-src 'self'; script-src 'self' 'unsafe-inline'; connect-src 'self' https://api.mainnet.klever.org"
/>
```

### 2. Input Validation

```typescript
import { isKleverAddress } from '@klever/connect-core'

function validateUserInput(address: string): boolean {
  // Sanitize input
  const sanitized = address.trim()

  // Validate format
  if (!isKleverAddress(sanitized)) {
    throw new Error('Invalid address format')
  }

  // Check length
  if (sanitized.length < 62 || sanitized.length > 63) {
    throw new Error('Invalid address length')
  }

  return true
}
```

### 3. Secure React Hooks

```typescript
import { useKlever } from '@klever/connect-react'
import { useEffect, useState } from 'react'

function SecureTransferComponent() {
  const { sendTransaction, account } = useKlever()
  const [isConfirmed, setIsConfirmed] = useState(false)

  const handleTransfer = async () => {
    // Require explicit user confirmation
    if (!isConfirmed) {
      alert('Please confirm the transaction')
      return
    }

    try {
      // Validate inputs
      if (!isKleverAddress(recipient)) throw new Error('Invalid recipient')
      if (amount <= 0n) throw new Error('Invalid amount')

      // Send transaction
      const tx = await sendTransaction({ to: recipient, value: amount })

      // Wait for confirmation
      await tx.wait()

      // Reset confirmation
      setIsConfirmed(false)
    } catch (error) {
      console.error('Transaction failed:', error)
      alert('Transaction failed: ' + error.message)
    }
  }

  return (
    <div>
      {/* Show transaction details */}
      <div>
        <p>From: {account}</p>
        <p>To: {recipient}</p>
        <p>Amount: {amount}</p>
      </div>

      {/* Require confirmation */}
      <label>
        <input
          type="checkbox"
          checked={isConfirmed}
          onChange={(e) => setIsConfirmed(e.target.checked)}
        />
        I confirm this transaction
      </label>

      <button onClick={handleTransfer} disabled={!isConfirmed}>
        Send Transaction
      </button>
    </div>
  )
}
```

---

## Dependency Security

### 1. Regular Updates

```bash
# Check for updates
pnpm update --latest

# Audit dependencies
pnpm audit

# Fix vulnerabilities
pnpm audit --fix
```

### 2. Lock Files

Always commit lock files:

```bash
# Commit to version control
git add pnpm-lock.yaml package-lock.json yarn.lock
```

### 3. Verify Package Integrity

```bash
# Verify checksums
pnpm install --frozen-lockfile
```

---

## Incident Response

If you suspect a security breach:

### 1. Immediate Actions

1. **Rotate all keys immediately**
2. **Revoke compromised credentials**
3. **Review transaction history**
4. **Notify affected users**
5. **Contact security@klever.io**

### 2. Investigation

1. **Collect logs** from all affected systems
2. **Identify attack vector**
3. **Assess impact** (funds lost, data exposed)
4. **Document findings**

### 3. Recovery

1. **Patch vulnerabilities**
2. **Deploy fixes**
3. **Monitor for further issues**
4. **Update security documentation**

---

## Security Checklist

Before deploying to production:

- [ ] All private keys stored securely (not hardcoded)
- [ ] Environment variables properly configured
- [ ] HTTPS endpoints used for all network requests
- [ ] Input validation implemented
- [ ] Transaction confirmation required for sensitive operations
- [ ] Error handling implemented
- [ ] Rate limiting enabled for public endpoints
- [ ] CSP headers configured (frontend)
- [ ] Dependencies audited and up-to-date
- [ ] Smart contracts tested on testnet
- [ ] Backup and recovery procedures documented
- [ ] Monitoring and alerting configured
- [ ] Incident response plan in place

---

## Additional Resources

- [Klever Blockchain Security Guide](https://docs.klever.org/security)
- [Web3 Security Best Practices](https://consensys.github.io/smart-contract-best-practices/)
- [OWASP Cryptographic Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)

---

## Contact

For security concerns:

- **Email**: security@klever.io
- **Bug Bounty**: Coming soon

For general support:

- **Forum**: https://forum.klever.org
- **Discord**: https://discord.gg/klever
- **GitHub Issues**: https://github.com/klever-io/klever-connect/issues

---

**Last Updated**: October 2025
**Next Review**: January 2026
