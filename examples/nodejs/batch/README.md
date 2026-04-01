# Batch Processing Examples

High-throughput batch operations using the Klever Connect SDK.

## Examples

| File               | Description                                          |
| ------------------ | ---------------------------------------------------- |
| `bulk-transfer.js` | Send multiple transfers in a single batch broadcast  |
| `csv-import.js`    | Import transfers from a CSV file and submit as batch |

## Usage

```bash
# Bulk transfer (hardcoded list in the file)
node batch/bulk-transfer.js

# CSV import
node batch/csv-import.js transfers.csv

# CSV import with dry run (validate without broadcasting)
DRY_RUN=true node batch/csv-import.js transfers.csv

# CSV import for a KDA token
ASSET_ID=MYTOKEN-ABCD node batch/csv-import.js transfers.csv
```

## CSV Format

```csv
address,amount
klv1receiver1...,1.5
klv1receiver2...,0.5
```

Header row is optional. Each row must have `address,amount`.

## Performance

Batch transactions are more efficient than individual sends:

- Nonce is fetched once, incremented locally per transaction
- All transactions are signed offline (no network per-tx)
- Single `broadcastTransactions()` call for the entire batch

## Required Environment Variables

```env
NETWORK=testnet
PRIVATE_KEY=your_hex_private_key
ASSET_ID=TOKEN-ID   # optional, defaults to KLV
DRY_RUN=true        # optional, validate without broadcasting
```
