#!/usr/bin/env node

const pbjs = require('protobufjs-cli/pbjs')
const pbts = require('protobufjs-cli/pbts')
const protobuf = require('protobufjs')
const fs = require('fs')
const os = require('os')
const path = require('path')

const protoDir = path.join(__dirname, '../proto')
const outDir = path.join(__dirname, '../src/proto')

// proto/*.proto are copies of klever-go's data/transaction/proto files, which
// define every contract the chain knows. Generate only the messages the SDK
// uses, plus everything they reference, to keep the bundle small.
const KEEP = [
  'Transaction',
  'TXContract',
  'TransferContract',
  'FreezeContract',
  'UnfreezeContract',
  'DelegateContract',
  'UndelegateContract',
  'WithdrawContract',
  'ClaimContract',
  'VoteContract',
  'CreateAssetContract',
  'SmartContract',
]

/** Load the protos and drop the top-level `proto` types nothing in KEEP reaches. */
function prunedDescriptor() {
  const root = new protobuf.Root()
  root.resolvePath = (origin, target) => {
    const local = path.join(protoDir, target)
    return fs.existsSync(local) ? local : protobuf.util.path.resolve(origin, target)
  }
  root.loadSync(
    [path.join(protoDir, 'transaction.proto'), path.join(protoDir, 'contracts.proto')],
    { keepCase: true, alternateCommentMode: true },
  )
  root.resolveAll()

  const ns = root.lookup('proto')
  const keep = new Set()
  const visit = (type) => {
    // Keep the top-level type that holds a nested one (Transaction.Raw -> Transaction)
    let top = type
    while (top.parent && top.parent !== ns) top = top.parent
    if (top.parent !== ns || keep.has(top.name)) return
    keep.add(top.name)
    const walk = (t) => {
      if (t instanceof protobuf.Type) {
        for (const field of t.fieldsArray) if (field.resolvedType) visit(field.resolvedType)
      }
      for (const nested of t.nestedArray || []) walk(nested)
    }
    walk(top)
  }
  for (const name of KEEP) {
    const type = ns.lookup(name)
    if (!type) throw new Error(`proto.${name} not found in ${protoDir}`)
    visit(type)
  }
  for (const nested of [...ns.nestedArray]) {
    if (!keep.has(nested.name)) ns.remove(nested)
  }
  return root.toJSON({ keepComments: true })
}

// Ensure output directory exists
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true })
}

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'klever-proto-'))
const descriptorPath = path.join(tmpDir, 'klever.json')
fs.writeFileSync(descriptorPath, JSON.stringify(prunedDescriptor()))

// Compile proto files to JavaScript
console.log('Compiling proto files to JavaScript...')
pbjs.main(
  [
    '--target',
    'static-module',
    '--wrap',
    'es6',
    '--force-number', // Use numbers instead of Long
    '--out',
    path.join(outDir, 'compiled.js'),
    descriptorPath,
  ],
  (err) => {
    fs.rmSync(tmpDir, { recursive: true, force: true })
    if (err) {
      console.error('Error compiling proto files:', err)
      process.exit(1)
    }

    console.log('Proto files compiled successfully!')

    // Generate TypeScript definitions
    console.log('Generating TypeScript definitions...')
    pbts.main(
      ['--out', path.join(outDir, 'compiled.d.ts'), path.join(outDir, 'compiled.js')],
      (err) => {
        if (err) {
          console.error('Error generating TypeScript definitions:', err)
          process.exit(1)
        }

        console.log('TypeScript definitions generated successfully!')
      },
    )
  },
)
