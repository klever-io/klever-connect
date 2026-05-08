# Expected output — nodejs-express-rest-api

Server boot:

```text
Klever REST server listening on http://localhost:3000 (testnet)
Endpoints:
  GET  /health
  GET  /balance?address=…&asset=…
  GET  /account?address=…
  GET  /tx/:hash
  POST /transfer  { to, amount, asset? }
```

Sample curl interactions:

```text
$ curl http://localhost:3000/health
{"ok":true,"network":"testnet","timestamp":1714780800000}

$ curl 'http://localhost:3000/balance?address=klv1ALICE…&asset=KLV'
{"address":"klv1ALICE…","asset":"KLV","balance":"1500000"}

$ curl 'http://localhost:3000/account?address=klv1ALICE…'
{"address":"klv1ALICE…","nonce":42,"balance":"1500000"}

$ curl http://localhost:3000/tx/7a3b…0f1d
{"hash":"7a3b…0f1d","status":"success"}

$ curl -X POST http://localhost:3000/transfer \
    -H 'content-type: application/json' \
    -d '{"to":"klv1BOB…","amount":"1.5"}'
{"hash":"5b3a…1e2f","status":"pending"}
```

Graceful shutdown (Ctrl-C):

```text
Received SIGINT. Closing HTTP server...
HTTP server closed.
```
