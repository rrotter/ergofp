#!/usr/bin/env node

const Footprint = require('./index.js').Footprint
const { readFile } = require('fs/promises')

async function main() {
  var path = process.argv[2]  
  var str = await readFile(path, 'utf8')

  fp = new Footprint(str)
  console.log(fp.toString()) // output kicad compatible sexp!
}

if (require.main === module) {
  main();
}

module.exports = {
  main,
}
