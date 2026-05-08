# Expected output — withdraw-after-cooldown

```text
Sender: klv1<your-address>
Withdrawing KLV (withdrawType=0)
Submitted: hash=<64-hex-chars> status=pending
Confirmed: status=success
Funds returned to liquid balance.
```

If the cooldown has not yet elapsed, the broadcast will succeed but the receipt
will report a failure status (`Confirmed: status=failed`) and you'll see the
underlying error in the explorer's tx detail page.
