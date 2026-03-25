# Klever Connect - Node.js Examples

Comprehensive Node.js examples demonstrating server-side usage of the Klever Connect SDK.
These examples cover backend applications, CLI tools, automation scripts, and production patterns.

## Prerequisites

- Node.js >= 18.0.0
- pnpm (used in this monorepo)
- A Klever testnet account with some KLV

## Setup

```bash
# From the monorepo root, build the SDK packages first
pnpm build

# Navigate to this directory
cd examples/nodejs

# Install dependencies
pnpm install

# Copy and configure environment variables
cp .env.example .env
# Edit .env with your private key and settings
```

## Categories

| Category                     | Description           | Examples                                |
| ---------------------------- | --------------------- | --------------------------------------- |
| [basic/](./basic/)           | Core operations       | balance, transfer, account info         |
| [cli/](./cli/)               | CLI wallet tools      | interactive wallet manager              |
| [server/](./server/)         | Express REST API      | transaction endpoints, account queries  |
| [automation/](./automation/) | Automated bots        | reward claiming, delegation rebalancing |
| [batch/](./batch/)           | Bulk operations       | multi-transfer, CSV import              |
| [monitoring/](./monitoring/) | Blockchain monitoring | block monitor with alerts               |
| [webhooks/](./webhooks/)     | Event webhooks        | transaction confirmation handler        |

## Quick Start

```bash
# Check account balance
node basic/balance.js

# Send a transfer
node basic/transfer.js

# Run the REST API server
node server/src/server.js

# Start the block monitor
node monitoring/block-monitor.js
```

## Security Best Practices

- **Never hardcode private keys** — always use environment variables or a secrets manager
- **Use `.env` files locally** — ensure `.env` is in your `.gitignore`
- **Rotate keys regularly** — use `wallet.disconnect(true)` to clear keys from memory
- **Validate inputs** — all examples validate addresses and amounts before broadcasting
- **Use testnet first** — set `NETWORK=testnet` during development

## Environment Variables

See [.env.example](./.env.example) for all available configuration options.

Required for most examples:

- `PRIVATE_KEY` — 64-character hex private key
- `NETWORK` — `testnet` | `mainnet` | `devnet`

## Running in Production

See [server/README.md](./server/README.md) for Docker and PM2 production deployment instructions.
