#!/usr/bin/env node

const SExpression = require('./index.js').SExpression
const { readFile } = require('fs/promises')

async function main() {
  var path = process.argv[2]  
  var str = await readFile(path, 'utf8')

  sexpr = SExpression.fromString(str)
  console.log(sexpr.toString()) // output kicad compatible sexp!
}

if (require.main === module) {
  main();
}

module.exports = {
  main,
}
