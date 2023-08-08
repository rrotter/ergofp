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

// wrapper for .kicad_mod file
// handles Footprint metadata (name, lib, src)
const KiCadMod = function (str, src = '', fp_name, lib) {
  this._str = str
  this.lib = lib
  this.name = fp_name
  pp = parseLibName(src)
  if (! this.name) {
    this.name = pp.name
  }
  if (! this.lib) {
    this.lib = pp.lib
  }
}
KiCadMod.prototype.toString = function () {
  return this._str
}

// factory for KiCadMod obj at _url_
async function fetchKiCadMod(url, library, fp_name) {
  txt = await fetch_text(url)
  return new KiCadMod(txt, url, library, fp_name)
}

// This is meant to parse the footprint and contain the an internal representation of it
// wip...
const Footprint = function (kicadmod) {
  this._kicadmod = kicadmod
  this._tree = undefined
}
Footprint.prototype.tree = function () {
  if (! this._tree) {
    this._tree = this._generate_tree()
  }
  return this._tree
}
Footprint.prototype._generate_tree = function () {
  let tree = {}
  str = this._kicadmod.toString()
  return tree
}

// factory for Footprint obj at _url_
async function fetchFootprint(url, library, fp_name) {
  mod = await fetchKiCadMod(url, library, fp_name)
  return new Footprint(mod)
}

module.exports = {
  fetch_text,
  parseLibName,
  KiCadMod,
  fetchKiCadMod,
  Footprint,
  fetchFootprint,
}
