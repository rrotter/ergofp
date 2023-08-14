#!/usr/bin/env node

const SExpression = require('./index.js').SExpression
const { readFile } = require('fs/promises')

async function main () {
  const path = process.argv[2]
  const str = await readFile(path, 'utf8')

  const sexpr = SExpression.fromString(str)
  console.log(sexpr.toString()) // output kicad compatible sexp!
}

if (require.main === module) {
  main()
}

module.exports = {
  main
}
