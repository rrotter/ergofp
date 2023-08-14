const nearley = require('nearley')
const grammar = require('./grammar.js')

async function fetchText (url) {
  const resp = await fetch(url)
  if (resp.status !== 200) {
    throw new Error(`fetch of ${resp.url} failed with ${resp.status}`)
  } else {
    return await resp.text()
  }
}

// get the name of KiCad library and footprint from a path
function parseLibName (src) {
  const match = src.match(/(?:\/([A-Za-z0-9\-_]+)\.pretty)?\/([A-Za-z0-9\-_]+).kicad_mod$/)
  const ret = { lib: undefined, name: undefined }
  if (match) {
    ret.lib = match[1]
    ret.name = match[2]
  }
  return ret
}

const joinWithSpace = [
  'general',
  'fp_line', 'fp_rect', 'fp_text', 'gr_arc', 'gr_line', 'stroke',
  'effects', 'font', 'model', 'offset', 'scale', 'rotate',
  'pad', 'model'
]
function treeToString (obj) {
  const toks = [obj.op]
  let containsSExpr = 0
  obj.args.forEach((arg) => {
    if (arg.op) {
      toks.push(treeToString(arg).replace(/\n/g, '\n  '))
      containsSExpr++
    } else {
      toks.push(arg)
    }
  })
  // don't add newline if this sexp contains no nested sexps, or is on list above
  if (containsSExpr === 0 || joinWithSpace.includes(obj.op)) {
    return `(${toks.join(' ')})`
  } else {
    return `(${toks.join('\n  ')}\n)`
  }
}

function cleanTree (obj) {
  const tree = {}
  tree.op = obj.op.value
  tree.args = []
  obj.args.forEach((arg) => {
    if (arg.op) {
      tree.args.push(cleanTree(arg))
    } else {
      tree.args.push(arg.value)
    }
  })
  return tree
}

class SExpression {
  static fromTree (tree, meta) {
    const op = tree.op

    if (this.subClasses[op]) {
      return new this.subClasses[op](tree, meta)
    }
    return new SExpression(tree)
  }

  static fromString (str, meta) {
    const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar))
    parser.feed(str)
    console.assert(parser.results.length === 1, parser.results)
    const tree = cleanTree(parser.results[0])
    return SExpression.fromTree(tree, meta)
  }

  constructor (tree) {
    this._tree = tree
  }

  _validate_type (expected) {
    if (this.type() !== expected) {
      throw new Error(`root sexpr for class ${this.constructor.name} must be "footprint", not "${this.type()}"`)
    }
  }

  toString () {
    return treeToString(this._tree)
  }

  type () {
    return this._tree.op
  }
}

// factory for Footprint obj at _url_
async function fetchFootprint (url) {
  const txt = await fetchText(url)
  const pp = parseLibName(url)
  return Footprint.fromString(txt, pp.lib)
}

// wrapper for .kicad_mod file
class Footprint extends SExpression {
  constructor (str, lib) {
    super(str)

    this.lib = lib

    // validate tree
    this._validate_type('footprint')

    // get name
    const quotedName = this._tree.args[0]
    this.name = quotedName.replace(/^"(.*)"$/, '$1')
  }

  name () {
    return this._tree.args[0]
  }
}

SExpression.subClasses = {
  footprint: Footprint
}

module.exports = {
  fetchText,
  parseLibName,
  Footprint,
  fetchFootprint,
  SExpression
}
