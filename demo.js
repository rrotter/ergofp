#!/usr/bin/env node

const nearley = require("nearley");
const grammar = require("./grammar.js");
const { readFile } = require('fs/promises')

async function parsefile(path) {
  var parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
  var txt = await readFile(path, 'utf8')
  parser.feed(txt)
  console.assert(parser.results.length == 1, parser.results)
  return parser.results[0]
}

function print_tree(obj, depth = 0) {
  console.log(`${" ".repeat(depth*2)}${obj.op}:`)
  obj.args.forEach((arg) => {
    if(arg.op) {
      print_tree(arg, depth+1)
    } else {
      console.log(`${" ".repeat(depth*2)}- ${arg}`)
    }
  })
}

function clean_tree(obj) {
  var tree = {}
  tree.op = obj.op.value
  tree.args = []
  obj.args.forEach((arg) => {
    if(arg.op) {
      tree.args.push(clean_tree(arg))
    } else {
      tree.args.push(arg.value)
    }
  })
  return tree
}

const join_with_space = [
  "general",
  "fp_line","fp_rect","fp_text","gr_arc","gr_line","stroke",
  "effects","font","model","offset","scale","rotate",
  "pad","model",
]
function tree2sexp(obj) {
  var toks = [obj.op]
  var contains_sexp = 0
  obj.args.forEach((arg) => {
    if(arg.op) {
      toks.push(tree2sexp(arg).replace(/\n/g, "\n  "))
      contains_sexp++
    } else {
      toks.push(arg)
    }
  })
  // don't add newline if this sexp contains no nested sexps, or is on list above
  if(contains_sexp==0 || join_with_space.includes(obj.op)) {
    return `(${toks.join(' ')})`
  } else {
    return `(${toks.join("\n  ")}\n)`
  }
}

async function main() {
  var file = process.argv[2]
  var result = await parsefile(file)
  // console.log(JSON.stringify(result)) // parse tree
  // console.log(JSON.stringify(clean_tree(result))) // parse tree w/o parser meta
  // print_tree(clean_tree(result)) // yaml-ish
  console.log(tree2sexp(clean_tree(result))) // output kicad compatible sexp!
}

if (require.main === module) {
  main();
}

module.exports = {
  main,
}
