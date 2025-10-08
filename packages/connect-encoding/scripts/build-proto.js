#!/usr/bin/env node

const pbjs = require('protobufjs-cli/pbjs')
const pbts = require('protobufjs-cli/pbts')
const fs = require('fs')
const path = require('path')

const protoDir = path.join(__dirname, '../proto')
const outDir = path.join(__dirname, '../src/proto')

// Ensure output directory exists
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true })
}

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
    '--path',
    protoDir,
    path.join(protoDir, 'transaction.proto'),
    path.join(protoDir, 'contracts.proto'),
  ],
  (err) => {
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
