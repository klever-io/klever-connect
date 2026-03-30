# Klever Connect SDK

## Project Overview

Modular TypeScript SDK for building applications on Klever Blockchain. Provides offline transaction building, ABI-based smart contract interactions, multi-wallet support (Node.js + browser extension), and React hooks for dApp development.

## Architecture

### Core Principles

1. **Developer-First Design** - Simple APIs that hide complexity
2. **Offline-First** - All transaction building works without network
3. **Type Safety** - Full TypeScript with branded types
4. **Modular** - Use only what you need
5. **React-Ready** - Built-in hooks and components

### Package Structure

```text
@klever/connect             - Main entry point (re-exports all packages)
@klever/connect-core        - Types, errors, constants, formatters
@klever/connect-encoding    - Proto encoding/decoding
@klever/connect-crypto      - Signing, key management, HD wallets
@klever/connect-provider    - Network communication (HTTP + WebSocket)
@klever/connect-transactions - Offline transaction building
@klever/connect-contracts   - Smart contract interactions (ABI)
@klever/connect-wallet      - Wallet implementations (Node + Browser)
@klever/connect-react       - React hooks & components
```

## API Overview

### Provider (Network Layer)

```typescript
import { KleverProvider } from '@klever/connect-provider'

const provider = new KleverProvider('mainnet') // 'mainnet' | 'testnet' | 'devnet' | 'local'
const balance = await provider.getBalance(address)
const nonce = await provider.getNonce(address)
```

### Wallet (Transaction Signing)

```typescript
import { NodeWallet } from '@klever/connect-wallet'

// Note: constructor is (provider, privateKey)
const wallet = new NodeWallet(provider, privateKey)
await wallet.connect()
const result = await wallet.transfer({ to: 'klv1...', amount: parseKLV('100') })
```

### Transaction Building (Offline)

```typescript
import { TransactionBuilder } from '@klever/connect-transactions'

const tx = TransactionBuilder.transfer({
  to: recipient,
  amount: parseKLV('100'),
})
  .sender(address)
  .buildRequest()
```

### Smart Contracts

```typescript
import { Contract } from '@klever/connect-contracts'

const contract = new Contract(address, abi, signer)
// Methods are called directly on the contract (no .methods property)
const result = await contract.transfer(to, amount)
```

### React Integration

```tsx
import { KleverProvider, useKlever, useBalance, useTransaction } from '@klever/connect-react'

function App() {
  const { connect, address, isConnected, provider } = useKlever()
  const { balance } = useBalance()
  const { sendKLV } = useTransaction()

  return <button onClick={() => sendKLV({ to, amount })}>Send KLV</button>
}

// Wrap app with provider
;<KleverProvider config={{ network: 'mainnet', autoConnect: true }}>
  <App />
</KleverProvider>
```

### Core Utilities

```typescript
import { parseKLV, formatKLV, isKleverAddress, createKleverAddress } from '@klever/connect-core'

parseKLV('100') // 100000000n (6 decimals)
formatKLV(100000000n) // '100'
isKleverAddress('klv1...') // true/false
```

## Implementation Status

### Phase 1: Foundation

- [x] Package structure (monorepo with pnpm workspaces)
- [x] Core types, branded types, and constants
- [x] Proto integration for transaction encoding
- [x] Build system (Turbo + tsup)

### Phase 2: Core Functionality

- [x] Provider implementation
  - [x] HTTP client with retry logic and exponential backoff
  - [x] WebSocket support (event manager with polling fallback)
  - [x] Custom error classes (NetworkError, ValidationError, etc.)
- [x] Wallet/Signer abstraction
  - [x] HD wallet support (BIP39/BIP44, Klever coin type 690)
  - [ ] Hardware wallet interface (LedgerSigner - interface only, not implemented)
  - [x] Browser extension support (BrowserWallet)
  - [x] Node.js wallet (NodeWallet)
- [x] Transaction builder
  - [x] All transaction types (Transfer, Freeze, Delegate, SmartContract, etc.)
  - [ ] Fee estimation (interface defined, logic not implemented)
  - [x] Nonce management (manual setting + provider fetch)

### Phase 3: Advanced Features

- [x] Contract abstraction
  - [x] ABI encoding/decoding (ABIEncoder, ABIDecoder)
  - [x] Event filtering (EventParser with topic/address filtering)
  - [x] Call vs Transaction (query vs invoke)
  - [x] Contract deployment (ContractFactory)
  - [x] ABI type mapper (type-mapper utilities)
- [x] React hooks
  - [ ] WalletConnect integration (not implemented)
  - [x] Transaction status monitoring (useTransactionMonitor)
  - [x] Account balance display (useBalance with polling)
  - [x] Staking operations (useStaking)
- [x] Utils and helpers
  - [x] Unit converters (parseKLV, formatKLV, parseUnits, formatUnits)
  - [x] Address validation (isKleverAddress, isValidAddress, isContractAddress)
  - [x] Branded types for type safety

### Phase 4: Developer Experience

- [x] Examples (basic, encoding, transactions, wallet, contracts, assets, nodejs)
- [ ] CLI tools
- [ ] Migration guides from other chains

## Technical Decisions

### Proto vs JSON-RPC

- **Proto**: Primary for transaction encoding
- **HTTP/REST**: For API communication with Klever nodes
- Both supported, developer chooses

### Wallet Architecture

```text
Wallet (interface)
├── BaseWallet (abstract base class)
│   ├── NodeWallet (private key, server-side)
│   └── BrowserWallet (extension + private key fallback)
├── Future: LedgerSigner (hardware)
└── Future: WalletConnect (mobile)
```

### Error Handling

Custom error classes with codes in `@klever/connect-core`:

- `KleverError` (base), `ValidationError`, `NetworkError`
- `TransactionError`, `ContractError`, `WalletError`
- `EncodingError`, `CryptoError`

## Development Workflow

### Project Structure

```text
klever-connect/
├── packages/
│   ├── connect/              - Main entry point
│   ├── connect-core/         - Types, errors, constants
│   ├── connect-encoding/     - Proto encoding/decoding
│   ├── connect-crypto/       - Signing, key management
│   ├── connect-provider/     - Network communication
│   ├── connect-transactions/ - Transaction building
│   ├── connect-contracts/    - Smart contract interactions
│   ├── connect-wallet/       - Wallet implementations
│   └── connect-react/        - React hooks & components
├── examples/                 - Usage examples (TS + Node.js)
├── .github/workflows/        - CI/CD pipelines
├── vitest.config.ts          - Root test configuration
└── package.json              - Root package with scripts
```

### Technology Stack

- **Package Manager**: pnpm 10.8.0
- **Build Tool**: Turbo (monorepo orchestration) + tsup (TypeScript bundler)
- **Testing**: Vitest with coverage via v8
- **Linting**: ESLint 10+ with TypeScript plugin (flat config: `eslint.config.js`)
- **Formatting**: Prettier (printWidth: 100) with lint-staged (husky pre-commit)
- **CI/CD**: GitHub Actions
- **Documentation**: TypeDoc with DMT theme
- **Release**: Changesets for versioning

### Key npm Scripts (Root Level)

```bash
pnpm build              # Build all packages with Turbo
pnpm test               # Run all tests across packages
pnpm test:integration   # Run integration tests (provider + transactions)
pnpm test:coverage      # Run tests with coverage
pnpm lint               # Lint all packages
pnpm format             # Format code with Prettier
pnpm format:check       # Check formatting
pnpm typecheck          # Type check all packages
pnpm dev                # Watch mode for all packages
pnpm clean              # Clean all builds and node_modules
pnpm changeset          # Create a changeset for release
```

### Per-Package Scripts

```bash
pnpm --filter @klever/connect-{package} build       # Build specific package
pnpm --filter @klever/connect-{package} test        # Test specific package
pnpm --filter @klever/connect-{package} test --run  # Run tests once (CI mode)
pnpm --filter @klever/connect-{package} lint        # Lint specific package
```

### Testing Conventions

Tests are located in `src/__tests__/` within each package.

#### Test Types

1. **Unit Tests** - Test individual functions/classes in isolation
2. **Integration Tests** - Test interaction between packages (e.g., provider + transactions)
3. **E2E Tests** - Tests marked with `.testnet.ts` (excluded from CI, require network)

#### Coverage

Each package has coverage thresholds configured in `vitest.config.ts` (enforced in CI via the `coverage` job). Thresholds vary per package — crypto/wallet packages have higher targets.

### CI/CD Pipeline

#### Main CI Workflow (`.github/workflows/ci.yml`)

Runs on every push to `master`/`develop` and all PRs:

- **format**: Check code formatting with Prettier
- **typecheck**: TypeScript type checking (requires build first)
- **lint**: ESLint checks
- **build**: Build all packages with Turbo
- **test**: Run all tests (requires build first)
- **coverage**: Run tests with coverage reporting
- **all-checks**: Gate that ensures all jobs pass

#### Other Workflows

- **release.yml**: Version packages (manual trigger on `develop`)
- **publish.yml**: Publish to npm (manual trigger on `master`)
- **docs.yml**: Generate TypeDoc documentation
- **security.yml**: Security scanning
- **size-check.yml**: Bundle size tracking
- **dependency-review.yml**: Dependency security checks
- **stale.yml**: Stale issue management

### Build Order & Dependencies

Turbo handles this automatically, but for manual builds:

1. **Core packages** (no internal deps): `connect-core`, `connect-crypto`, `connect-encoding`
2. **Mid-level**: `connect-provider`, `connect-transactions` (depend on core)
3. **High-level**: `connect-contracts`, `connect-wallet` (depend on mid-level)
4. **Integration**: `connect-react`, `connect` (depend on everything)

### Code Quality Standards

#### Type Safety

- All packages use TypeScript strict mode
- Branded types for addresses, amounts, hashes (see `@klever/connect-core`)
- No `any` types except in tests where necessary

#### Testing Requirements

- All new features must have tests
- Coverage thresholds enforced per package in `vitest.config.ts`
- Integration tests for cross-package functionality
- Mock network calls in unit tests

#### Code Style

- Prettier enforced via pre-commit hooks (printWidth: 100)
- ESLint configured with TypeScript rules
- Use named exports over default exports
- Document public APIs with JSDoc comments

### Git Workflow

#### Branch Strategy

- `master` - Production releases only
- `develop` - Main development branch
- Feature branches: `feature/description` or `KLC-XXX-description` (for Jira)

#### Commit Messages

Follow conventional commits:

```text
feat(contracts): add event filtering support
fix(provider): handle network timeout errors
docs(readme): update installation instructions
test(wallet): add HD wallet derivation tests
chore(deps): update dependencies
```

#### Pull Requests

- All PRs target `develop`, never `master` directly (except hotfixes and release PRs)
- PR title should include `[KLC-XXX]` prefix if related to Jira issue
- Every PR that affects published packages must include a changeset (`pnpm changeset`) — prefer `minor`/`patch`, use `major` only for drastic breaking changes. Docs-only, test-only, or chore-only PRs that don't change package behavior do not require a changeset.
- PRs are **squash merged** to `develop`
- Link related Jira issues in description
- CI must pass before merge
- Require at least one approval

### Dependency Management

#### Security Fixes (Dependabot / npm audit)

- **Always prefer updating the parent package** over adding `pnpm.overrides`
  - Example: if `express` pulls a vulnerable `path-to-regexp`, bump `express` to a version that resolves it
  - Overrides are a last resort for transitive deps where no upstream fix exists
- When overrides are necessary, use `>=` ranges (e.g., `">=0.1.13"`) not exact pins, so future patches are picked up
- Run `pnpm audit` to verify fixes actually resolve the vulnerability
- Overrides only apply within this monorepo — they don't propagate to consumers of published packages

### Release Process

```text
PR → develop (squash) → Version Packages workflow → PR to master (merge, NO squash) → Publish workflow
```

1. Feature PRs go to `develop` with changesets, squash merged
2. Run "Version Packages" workflow on `develop` (or `pnpm run version` locally)
3. Create PR from `develop` → `master`
4. **Merge to master with regular merge** (do NOT squash — preserves version bump commits)
5. Run "Publish Packages" workflow on `master`
6. Verify: `npm view @klever/connect version`

### Adding a New Feature

1. Create feature branch from `develop`
2. Implement feature with tests
3. Run `pnpm test` and `pnpm build` locally
4. Run `pnpm lint` and `pnpm format`
5. Create changeset: `pnpm changeset`
6. Create PR to `develop` (CI will run all checks)
7. After review, squash merge to `develop`

### Running Tests

```bash
pnpm test                                               # All tests
pnpm --filter @klever/connect-contracts test            # Specific package
pnpm --filter @klever/connect-contracts test --watch    # Watch mode
pnpm test:integration                                   # Integration tests
pnpm --filter @klever/connect-contracts test --coverage # With coverage
```

### Debugging Build Issues

```bash
pnpm clean && pnpm install && pnpm build    # Clean rebuild
pnpm list --filter @klever/connect-contracts --depth=1  # Check deps
```

### Known Issues & Gotchas

1. **Build order matters** - Turbo handles this, but manual builds may fail if dependencies aren't built first
2. **Vitest aliases** - Root `vitest.config.ts` resolves packages to `src/index.ts` for testing without building
3. **Integration tests need build** - CI runs `pnpm build` before `pnpm test`
4. **Testnet tests excluded** - `.testnet.ts` files excluded from CI; run manually: `pnpm --filter @klever/connect-provider test -- src/__tests__/*.testnet.ts`

### Troubleshooting

- **"Cannot find module"** - Run `pnpm build`, check `vitest.config.ts` aliases, verify `package.json` exports
- **Type errors in tests** - Run `pnpm typecheck`, ensure dependent packages are built
- **Slow tests** - Use `vitest --reporter=verbose`, check for unnecessary network calls, use mocks

## Security Considerations

1. Never expose private keys
2. Validate all inputs at system boundaries
3. Secure random number generation for crypto
4. Constant-time operations for crypto
5. Regular security audits

## Performance Goals

- < 100ms for transaction building
- < 50ms for encoding/decoding
- < 10KB bundle size for minimal usage
- Tree-shakeable for optimal bundle size

## Not Yet Implemented

- Hardware wallet support (LedgerSigner)
- WalletConnect integration
- Fee estimation logic
- CLI tools
- Migration guides from other chains
