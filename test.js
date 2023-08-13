// things we're testing
const fetch_text = require('./index.js').fetch_text
const parseLibName = require('./index.js').parseLibName
const Footprint = require('./index.js').Footprint
const fetchFootprint = require('./index.js').fetchFootprint
const SExpression = require('./index.js').SExpression

// test libraries
const should = require('chai').should()
const expect = require('chai').expect

// fixtures
const footprint_samples = require('./fixtures/footprint_samples.js')
const { readFile } = require('fs/promises')

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
    if (fp == 'th_sample_footprint') {
      message = footprint_samples.th
    }
    else if (fp == 'smd_sample_footprint') {
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
    let txt = await fetch_text('http://localhost:9876/footprints.pretty/smd_sample_footprint.kicad_mod')
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
    obj.name.should.equal("whatever")
    obj.lib.should.equal("some_fp_collection")
  })
  it('find lib and name from local path', function() {
    let obj = parseLibName("/any/local/path/another_fp_collection.pretty/some_footprint.kicad_mod")
    obj.name.should.equal("some_footprint")
    obj.lib.should.equal("another_fp_collection")
  })
  it('find nothing', function() {
    let obj = parseLibName("https://example.com/any/some_fp_collection.pretty/whatever.kicad_mode")
    expect(obj.name).to.be.undefined
    expect(obj.lib).to.be.undefined
  })
})

describe('Footprint', function() {
  before(async function () {
    this.footprint_string = await readFile('fixtures/sample/footprints.pretty/smd_simple_sample.kicad_mod', 'utf8')
    this.footprint = new Footprint(this.footprint_string,"https://example.com/any/some_fp_collection.pretty/whatever.kicad_mod")
  })

  it('is a Footprint', function() {
    this.footprint.should.be.an.instanceof(Footprint)
  })
  it('inherits from SExpression', function() {
    this.footprint.should.be.an.instanceof(SExpression)
  })
  it('has expected content', function() {
    this.footprint.toString().should.match(/footprint/)
    this.footprint.toString().should.match(/smd_simple_sample/)
    this.footprint.toString().should.match(/\(attr smd\)/)
  })
  it('get names from src', function() {
    this.footprint.name.should.equal("smd_simple_sample")
    this.footprint.lib.should.equal("some_fp_collection")
  })
  it('use supplied names', function() {
    let footprint = new Footprint(this.footprint_string,"https://example.com/any/some_fp_collection.pretty/whatever.kicad_mod","baz")
    // footprint.name.should.equal("bar")
    footprint.lib.should.equal("baz")
  })
})

describe('fetchFootprint', function() {
  it('fetches string data from url', async function() {
    let footprint = await fetchFootprint("http://localhost:9876/footprints.pretty/smd_sample_footprint.kicad_mod")
    footprint.toString().should.match(/footprint/)
    footprint.toString().should.match(/smd_simple_sample/)
  })
  it('names object correctly', async function() {
    let footprint = await fetchFootprint("http://localhost:9876/footprints.pretty/smd_sample_footprint.kicad_mod")
    footprint.name.should.equal("smd_sample_footprint")
    footprint.lib.should.equal("footprints")
  })
  it('returns a Footprint object', async function() {
    let footprint = await fetchFootprint("http://localhost:9876/footprints.pretty/smd_sample_footprint.kicad_mod")
    footprint.should.be.an.instanceof(Footprint)
  })
})

describe('SExpression', function() {
  before(async function() {
    let pcb_str = await readFile('fixtures/sample/sample.kicad_pcb', 'utf8')
    let fp_str = await readFile('fixtures/sample/footprints.pretty/smd_simple_sample.kicad_mod', 'utf8')
    this.pcb = new SExpression(pcb_str)
    this.fp = new SExpression(fp_str)
  })

  it('parses input string', function() {
    let sexpr = new SExpression("(this (is actually) (a valid) SExpression (with SoooperSecretData))")
    sexpr.toString().should.match(/\(with\s+SoooperSecretData\s*\)/)
  })
  it('parses sample files', function() {
    this.pcb.toString().should.match(/kicad_pcb/)
    this.pcb.toString().should.match(/Project Footprints\:smd_simple_sample/)
    this.fp.toString().should.match(/smd_simple_sample/)
    this.fp.toString().should.match(/footprint/)
    this.fp.toString().should.match(/smd roundrect/)
  })
  it('gets type of sample files', function() {
    this.pcb.type().should.equal("kicad_pcb")
    this.fp.type().should.equal("footprint")
  })
})
