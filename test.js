const fetch_text = require('./index.js').fetch_text
const parseLibName = require('./index.js').parseLibName
const KiCadMod = require('./index.js').KiCadMod
const Footprint = require('./index.js').Footprint
const fetchKiCadMod = require('./index.js').fetchKiCadMod
const fetchFootprint = require('./index.js').fetchFootprint

const footprint_samples = require('./fixtures/footprint_samples.js') 

const should = require('chai').should()
const expect = require('chai').expect

// set up test server to pull data from
const http = require('http');

const hostname = '127.0.0.1';
const port = 9876;

const server = http.createServer((req, res) => {
  let path = new URL(req.url, `http://${req.headers.host}`).pathname

  // allow tests to request sample footprint files
  let status = 200
  message = "Hello World\n"
  let match = path.match(/^\/footprints\.pretty\/(\w+)/)
  if (match) {
    fp = match[1]
    if (fp == 'th') {
      message = footprint_samples.th
    }
    else if (fp == 'smd') {
      message = footprint_samples.smd 
    }
    else {
      // allow tests to request a 404
      status = 404
      message = "404 not found\n"
    }
  }

  res.statusCode = status
  res.setHeader('Content-Type', 'text/plain')
  res.end(message)
})

before(function() {
  server.listen(port, hostname, () => {})
})

// destroy test server
after(function() {
  server.close()
})

describe('fetch_text()', function() {
  it('fetch string over http', async function() {
    let txt = await fetch_text('http://localhost:9876/')
    txt.should.equal("Hello World\n")
  })
  it('fetch long string over http', async function() {
    let txt = await fetch_text('http://localhost:9876/footprints.pretty/smd.kicad_mod')
    txt.should.equal(footprint_samples.smd)
  })
})

describe('parseLibName()', function() {
  it('find name, no lib', function() {
    let obj = parseLibName("https://example.com/any/path/myname.kicad_mod")
    expect(obj.name).to.equal("myname")
    expect(obj.lib).to.be.undefined
  })
  it('find lib and name from url', function() {
    let obj = parseLibName("https://example.com/any/some_fp_collection.pretty/whatever.kicad_mod")
    expect(obj.name).to.equal("whatever")
    expect(obj.lib).to.equal("some_fp_collection")
  })
  it('find lib and name from local path', function() {
    let obj = parseLibName("/any/local/path/another_fp_collection.pretty/some_footprint.kicad_mod")
    expect(obj.name).to.equal("some_footprint")
    expect(obj.lib).to.equal("another_fp_collection")
  })
  it('find nothing', function() {
    let obj = parseLibName("https://example.com/any/some_fp_collection.pretty/whatever.kicad_mode")
    expect(obj.name).to.be.undefined
    expect(obj.lib).to.be.undefined
  })
})

describe('KiCadMod', function() {
  it('get names from src', function() {
    let mod = new KiCadMod("foo","https://example.com/any/some_fp_collection.pretty/whatever.kicad_mod")
    expect(mod.name).to.equal("whatever")
    expect(mod.lib).to.equal("some_fp_collection")
  })
  it('use supplied names', function() {
    let mod = new KiCadMod("foo","https://example.com/any/some_fp_collection.pretty/whatever.kicad_mod","bar","baz")
    expect(mod.name).to.equal("bar")
    expect(mod.lib).to.equal("baz")
  })
})

describe('fetchKiCadMod', function() {
  it('fetches string data from url', async function() {
    let mod = await fetchKiCadMod("http://localhost:9876/footprints.pretty/smd.kicad_mod")
    mod.toString().should.match(/footprint/)
    mod.toString().should.match(/smd_simple_sample/)
  })
  it('names object correctly', async function() {
    let mod = await fetchKiCadMod("http://localhost:9876/footprints.pretty/smd.kicad_mod")
    expect(mod.name).to.equal("smd")
    expect(mod.lib).to.equal("footprints")

    let mod_with_name_from_param = await fetchKiCadMod("http://localhost:9876/footprints.pretty/smd.kicad_mod","foo","bar")
    expect(mod_with_name_from_param.name).to.equal("foo")
    expect(mod_with_name_from_param.lib).to.equal("bar")
  })
  it('returns a KiCadMod object', async function() {
    let mod = await fetchKiCadMod("http://localhost:9876/footprints.pretty/smd.kicad_mod")
    expect(mod).to.be.an.instanceof(KiCadMod)
  })
})

describe('Footprint', function() {
  before(async function () {
    this.fp = await fetchFootprint("http://localhost:9876/footprints.pretty/smd.kicad_mod")
  })

  it('footprint constructor', function() {
    let fp = new Footprint(new KiCadMod())
    expect(fp).to.be.an.instanceof(Footprint)
  })
  it('fetches footprint', function() {
    expect(this.fp).to.be.an.instanceof(Footprint)
  })
  it('footprint.tree returns a js object', function() {
    let tree = this.fp.tree()
    expect(typeof tree).to.equal('object')
  })
})
