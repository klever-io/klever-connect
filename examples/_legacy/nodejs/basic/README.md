# Basic Examples

Core Klever Connect operations for Node.js.

## Examples

| File              | Description                      |
| ----------------- | -------------------------------- |
| `balance.js`      | Query KLV and KDA token balances |
| `transfer.js`     | Send KLV or KDA tokens           |
| `account-info.js` | Fetch full account details       |

## Usage

```bash
# Check balance (uses ADDRESS or derives from PRIVATE_KEY)
node basic/balance.js

# Send a transfer
RECEIVER_ADDRESS=klv1... TRANSFER_AMOUNT=0.5 node basic/transfer.js

# View full account info
node basic/account-info.js
```

## Required Environment Variables

```env
NETWORK=testnet
PRIVATE_KEY=your_hex_private_key
RECEIVER_ADDRESS=klv1...    # for transfer.js only
```
