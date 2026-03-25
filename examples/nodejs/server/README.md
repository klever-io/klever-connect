# Server Example

Express REST API server integrating the Klever Connect SDK.

## Endpoints

| Method | Path                                        | Description                          |
| ------ | ------------------------------------------- | ------------------------------------ |
| `GET`  | `/health`                                   | Server health + current block number |
| `GET`  | `/accounts/:address`                        | Full account info                    |
| `GET`  | `/accounts/:address/balance`                | KLV balance                          |
| `GET`  | `/accounts/:address/balance?asset=TOKEN-ID` | KDA token balance                    |
| `POST` | `/transactions/transfer`                    | Submit a transfer transaction        |
| `GET`  | `/transactions/:hash`                       | Get transaction by hash              |

## Running

```bash
# Development
node server/src/server.js

# With PM2 (production)
pm2 start server/ecosystem.config.js --env production
pm2 logs klever-api

# With Docker (run from monorepo root):
docker build -t klever-api -f examples/nodejs/server/Dockerfile .
docker run -p 3000:3000 \
  -e NETWORK=testnet \
  -e PRIVATE_KEY=your_key \
  klever-api
# Note: use Docker secrets or a secrets manager for PRIVATE_KEY in production
```

## Example Requests

```bash
# Health check
curl http://localhost:3000/health

# Get account balance
curl http://localhost:3000/accounts/klv1...

# Submit transfer (requires PRIVATE_KEY in env)
curl -X POST http://localhost:3000/transactions/transfer \
  -H "Content-Type: application/json" \
  -d '{"receiver": "klv1...", "amount": "1.5"}'
```

## Required Environment Variables

```env
NETWORK=testnet
PORT=3000
PRIVATE_KEY=your_hex_private_key   # required for POST /transactions/transfer
```
