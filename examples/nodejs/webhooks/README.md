# Webhook Examples

Webhook server for receiving and processing Klever blockchain event notifications.

## Examples

| File                | Description                                                 |
| ------------------- | ----------------------------------------------------------- |
| `webhook-server.js` | Express server that receives and verifies webhook callbacks |

## Usage

```bash
# Start webhook server
node webhooks/webhook-server.js

# Test with curl (use your WEBHOOK_SECRET)
curl -X POST http://localhost:3001/webhook \
  -H "Content-Type: application/json" \
  -H "x-klever-signature: sha256=$(echo -n '{"event":"transaction.confirmed","data":{"txHash":"abc123"}}' | openssl dgst -sha256 -hmac 'your_secret' | awk '{print $2}')" \
  -d '{"event":"transaction.confirmed","data":{"txHash":"abc123","address":"klv1...","amount":"1000000"}}'
```

## Security

Webhooks are authenticated using HMAC-SHA256 signatures:

1. The sender signs the raw request body with your `WEBHOOK_SECRET`
2. The server recomputes the signature and compares using a timing-safe comparison
3. Requests with invalid or missing signatures are rejected with `401`

Always set a strong `WEBHOOK_SECRET` in production.

## Supported Events

| Event                   | Description                          |
| ----------------------- | ------------------------------------ |
| `transaction.confirmed` | A transaction was confirmed on-chain |
| `transaction.failed`    | A transaction failed                 |

## Required Environment Variables

```env
WEBHOOK_PORT=3001
WEBHOOK_SECRET=your_random_secret_string
NETWORK=testnet
```
