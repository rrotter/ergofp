const nearley = require("nearley");
const grammar = require("./grammar.js");

async function fetch_text(url) {
  resp = await fetch(url)
  if (resp.status != 200) {
    throw new Error(`fetch of ${resp.url} failed with ${resp.status}`)
  } else {
    return await resp.text()
  }
}

// get the name of KiCad library and footprint from a path
function parseLibName(src) {
  m = src.match(/(?:\/([A-Za-z0-9\-_]+)\.pretty)?\/([A-Za-z0-9\-_]+).kicad_mod$/)
  r = {lib: undefined, name: undefined}
  if (m) {
    r.lib = m[1]
    r.name = m[2]
  }
  return r
}

const join_with_space = [
  "general",
  "fp_line","fp_rect","fp_text","gr_arc","gr_line","stroke",
  "effects","font","model","offset","scale","rotate",
  "pad","model",
]
function tree_to_string(obj) {
  var toks = [obj.op]
  var contains_sexp = 0
  obj.args.forEach((arg) => {
    if(arg.op) {
      toks.push(tree_to_string(arg).replace(/\n/g, "\n  "))
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

class SExpression {
  static fromTree (tree, meta) {
    let op = tree.op

    if (this.subClasses[op]) {
      return new this.subClasses[op](tree, meta)
    }
    return new SExpression(tree)
  }
  static fromString (str, meta) {
    let parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
    parser.feed(str)
    console.assert(parser.results.length == 1, parser.results)
    let tree = clean_tree(parser.results[0])
    return SExpression.fromTree(tree, meta)
  }
  constructor (tree) {
    this._tree = tree
  }

  _validate_type (expected) {
    if (this.type() != expected) {
      throw new Error(`root sexpr for class ${this.constructor.name} must be \"footprint\", not \"${this.type()}\"`)
    }
  }

  toString () {
    return tree_to_string(this._tree)
  }

  type () {
    return this._tree.op
  }
}

// factory for Footprint obj at _url_
async function fetchFootprint(url) {
  txt = await fetch_text(url)
  let pp = parseLibName(url)
  return Footprint.fromString(txt, pp.lib)
}

// wrapper for .kicad_mod file
class Footprint extends SExpression {
  constructor (str, lib) {
    super(str)

    this.lib = lib

    // validate tree
    this._validate_type("footprint")

    // get name
    let quoted_name = this._tree.args[0]
    this.name = quoted_name.replace(/^"(.*)"$/,'$1')
  }

  name () {
    return this._tree.args[0]
  }
}

SExpression.subClasses = {
  'footprint': Footprint
}

module.exports = {
  fetch_text,
  parseLibName,
  Footprint,
  fetchFootprint,
  SExpression,
}
