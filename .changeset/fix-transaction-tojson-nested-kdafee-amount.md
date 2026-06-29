---
'@klever/connect-transactions': patch
---

fix(transactions): convert nested KDAFee.Amount (int64) from string to number in transaction JSON so the extension can unmarshal it
