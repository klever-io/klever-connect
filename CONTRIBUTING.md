# Contributing to Klever Connect SDK

Thank you for your interest in contributing to Klever Connect! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Commit Guidelines](#commit-guidelines)
- [Release Process](#release-process)

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for all contributors.

## Getting Started

### Prerequisites

- Node.js 20+ or 22+
- pnpm 10+
- Git

### Setup

```bash
# Clone the repository
git clone https://github.com/klever-io/klever-connect.git
cd klever-connect

# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test
```

### Repository Structure

```
klever-connect/
├── packages/
│   ├── connect/              # Main entry point
│   ├── connect-core/         # Core types and utilities
│   ├── connect-crypto/       # Cryptographic operations
│   ├── connect-encoding/     # Proto encoding/decoding
│   ├── connect-provider/     # Network provider
│   ├── connect-transactions/ # Transaction building
│   ├── connect-contracts/    # Smart contract interactions
│   ├── connect-wallet/       # Wallet implementations
│   └── connect-react/        # React hooks and components
├── docs/                     # Documentation
└── .github/                  # GitHub workflows and templates
```

## Development Workflow

### 1. Create a Branch

```bash
# For features
git checkout -b feat/your-feature-name

# For bug fixes
git checkout -b fix/issue-description

# For documentation
git checkout -b docs/what-you-are-documenting
```

### 2. Make Changes

- Write clean, readable code
- Add tests for new functionality
- Update documentation as needed
- Follow existing code style

> **Note**: A pre-commit hook will check that your staged files are formatted and linted. If checks fail, the commit will be blocked. Run `pnpm format` and `pnpm lint --fix` to fix issues before committing.

### 3. Run Checks

```bash
# Format code
pnpm format

# Check formatting (without writing)
pnpm format:check

# Type check
pnpm typecheck

# Lint
pnpm lint

# Run tests
pnpm test

# Build
pnpm build
```

### 4. Create a Changeset

For any changes that affect published packages, create a changeset:

```bash
# Interactive changeset creation
pnpm changeset

# Select affected packages
# Choose version bump type (patch/minor/major)
# Write a clear summary
```

**Changeset Guidelines:**

- **Patch** (0.1.0 → 0.1.1): Bug fixes, documentation updates
- **Minor** (0.1.0 → 0.2.0): New features, non-breaking changes
- **Major** (0.1.0 → 1.0.0): Breaking changes (use sparingly in 0.x)

**Example changeset summary:**

```markdown
Add support for hardware wallet signing

Implements Ledger and Trezor support for transaction signing.
Users can now connect hardware wallets via WebUSB.
```

### 5. Commit Your Changes

Follow conventional commit format:

```bash
git commit -m "feat: add hardware wallet support"
git commit -m "fix: resolve transaction nonce race condition"
git commit -m "docs: update wallet API documentation"
```

## Pull Request Process

### Before Opening a PR

- ✅ All tests pass (`pnpm test`)
- ✅ Type checking passes (`pnpm typecheck`)
- ✅ Linting passes (`pnpm lint`)
- ✅ Build succeeds (`pnpm build`)
- ✅ Changeset created (for package changes)
- ✅ Documentation updated (if needed)

### Opening a PR

1. Push your branch to your fork
2. Open a PR against `develop` branch (not `master`)
3. Fill out the PR template completely
4. Link related issues with `Closes #123` or `Fixes #456`
5. Request review from maintainers

### PR Requirements

- **Title**: Use conventional commit format
  - `feat: add new feature`
  - `fix: resolve bug`
  - `docs: update documentation`
  - `refactor: improve code structure`
  - `test: add missing tests`
  - `chore: update dependencies`

- **Description**: Clear explanation of changes
- **Testing**: Describe how you tested the changes
- **Breaking Changes**: Clearly document any breaking changes
- **Screenshots**: Include for UI changes (React components)

### Review Process

1. Automated checks must pass (CI/CD)
2. At least one maintainer approval required
3. Address review feedback
4. Maintainer will merge when ready

## Coding Standards

### TypeScript

- Use strict TypeScript configuration
- Avoid `any` types (use `unknown` if needed)
- Export types alongside implementations
- Use branded types for domain-specific values

```typescript
// ✅ Good
export type KleverAddress = Brand<string, 'KleverAddress'>

export function createAddress(value: string): KleverAddress {
  if (!isValidAddress(value)) {
    throw new Error('Invalid address')
  }
  return value as KleverAddress
}

// ❌ Bad
export function createAddress(value: string): string {
  return value
}
```

### Code Style

- Use 2 spaces for indentation
- Use single quotes for strings
- Add trailing commas in objects/arrays
- Use arrow functions for callbacks
- Prefer `const` over `let`

### Documentation

- Add JSDoc comments for public APIs
- Include `@example` blocks for complex functions
- Document parameters and return types
- Add security warnings where appropriate

````typescript
/**
 * Signs a transaction with the wallet's private key
 *
 * @param tx - The unsigned transaction to sign
 * @returns The signed transaction ready for broadcasting
 *
 * @throws {WalletError} If wallet is not connected or transaction is invalid
 *
 * @example
 * ```typescript
 * const unsignedTx = await builder.build()
 * const signedTx = await wallet.signTransaction(unsignedTx)
 * ```
 */
async signTransaction(tx: Transaction): Promise<Transaction>
````

## Testing Guidelines

### Unit Tests

- Write tests for all new functionality
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)
- Mock external dependencies

```typescript
describe('Wallet', () => {
  it('should sign transaction with valid private key', async () => {
    // Arrange
    const wallet = new Wallet(testPrivateKey, provider)
    const unsignedTx = createTestTransaction()

    // Act
    const signedTx = await wallet.signTransaction(unsignedTx)

    // Assert
    expect(signedTx.isSigned()).toBe(true)
    expect(signedTx.signature).toBeDefined()
  })
})
```

### Integration Tests

- Test real API interactions (use testnet)
- Mark as integration tests
- Use environment variables for configuration

```typescript
describe('Provider Integration', () => {
  it('should fetch account from testnet', async () => {
    const provider = new KleverProvider('testnet')
    const account = await provider.getAccount(testAddress)
    expect(account.balance).toBeGreaterThanOrEqual(0)
  })
})
```

### Test Coverage

- Aim for >80% code coverage
- 100% coverage for critical paths (crypto, signing)
- Don't test implementation details

## Commit Guidelines

### Conventional Commits

Format: `<type>(<scope>): <description>`

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic change)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks (deps, build, etc.)
- `perf`: Performance improvements

**Examples:**

```bash
feat(wallet): add hardware wallet support
fix(provider): resolve cache invalidation bug
docs(contracts): update ABI encoding examples
test(crypto): add signature verification tests
chore(deps): update dependencies
```

### Commit Best Practices

- Keep commits atomic (one logical change per commit)
- Write clear, descriptive commit messages
- Reference issues in commit body: `Closes #123`
- Add breaking change notice: `BREAKING CHANGE: ...`

## Release Process

### Version Management

We use [Changesets](https://github.com/changesets/changesets) for version management.

1. **Create changeset** during development
2. **Version packages** when ready to release
3. **Publish manually** after review

### Versioning Strategy

Following semantic versioning (semver):

- **0.x.x**: Pre-1.0 releases (current)
  - Minor bumps can include breaking changes
  - Indicates API may still change
- **1.0.0+**: Stable releases
  - Breaking changes = major bump
  - New features = minor bump
  - Bug fixes = patch bump

### Publishing (Maintainers Only)

```bash
# 1. Ensure you're on master with latest changes
git checkout master
git pull origin master

# 2. Build and test
pnpm build
pnpm test

# 3. Publish to npm
pnpm -r publish --access public

# 4. Create git tags
git tag v0.1.0
git push --tags

# 5. Create GitHub release
gh release create v0.1.0 --generate-notes
```

## Need Help?

- 📖 [Documentation](https://klever-io.github.io/klever-connect/)
- 💬 [Discussions](https://github.com/klever-io/klever-connect/discussions)
- 🐛 [Issues](https://github.com/klever-io/klever-connect/issues)
- 📧 Email: [support contact - update this]

## Security Issues

**DO NOT** open public issues for security vulnerabilities.

Please report security issues privately to: [security contact - update this]

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Klever Connect! 🚀
