// things we're testing
const fetchText = require('./index.js').fetchText
const parseLibName = require('./index.js').parseLibName
const Footprint = require('./index.js').Footprint
const fetchFootprint = require('./index.js').fetchFootprint
const SExpression = require('./index.js').SExpression

/* eslint-env mocha */
const should = require('chai').should()

// fixtures
const { readFile } = require('fs/promises')

// set up test server to pull data from
const http = require('http')

const hostname = '127.0.0.1'
const port = 9876

const server = http.createServer((req, res) => {
  const path = new URL(req.url, `http://${req.headers.host}`).pathname

  // allow tests to request sample footprint files
  let status = 200
  let message = 'Hello World\n'
  const match = path.match(/^\/footprints\.pretty\/(\w+)/)
  if (match) {
    const fp = match[1]
    if (fp === 'th_sample_footprint') {
      message = footprintSamples.th
    } else if (fp === 'smd_sample_footprint') {
      message = footprintSamples.smd
    } else {
      // allow tests to request a 404
      status = 404
      message = '404 not found\n'
    }
  }

  res.statusCode = status
  res.setHeader('Content-Type', 'text/plain')
  res.end(message)
})

before(function () {
  server.listen(port, hostname, () => {})
})

// destroy test server
after(function () {
  server.close()
})

describe('fetchText()', function () {
  it('fetch string over http', async function () {
    const txt = await fetchText('http://localhost:9876/')
    txt.should.equal('Hello World\n')
  })
  it('fetch long string over http', async function () {
    const txt = await fetchText('http://localhost:9876/footprints.pretty/smd_sample_footprint.kicad_mod')
    txt.should.equal(footprintSamples.smd)
  })
})

describe('parseLibName()', function () {
  it('find name, no lib', function () {
    const obj = parseLibName('https://example.com/any/path/myname.kicad_mod')
    obj.name.should.equal('myname')
    should.not.exist(obj.lib)
  })
  it('find lib and name from url', function () {
    const obj = parseLibName('https://example.com/any/some_fp_collection.pretty/whatever.kicad_mod')
    obj.name.should.equal('whatever')
    obj.lib.should.equal('some_fp_collection')
  })
  it('find lib and name from local path', function () {
    const obj = parseLibName('/any/local/path/another_fp_collection.pretty/some_footprint.kicad_mod')
    obj.name.should.equal('some_footprint')
    obj.lib.should.equal('another_fp_collection')
  })
  it('find nothing', function () {
    const obj = parseLibName('https://example.com/any/some_fp_collection.pretty/whatever.kicad_mode')
    should.not.exist(obj.name)
    should.not.exist(obj.lib)
  })
})

describe('Footprint', function () {
  before(async function () {
    this.footprint_string = await readFile('fixtures/sample/footprints.pretty/smd_simple_sample.kicad_mod', 'utf8')
    this.footprint = SExpression.fromString(this.footprint_string, 'some_fp_collection')
  })

  it('is a Footprint', function () {
    this.footprint.should.be.an.instanceof(Footprint)
  })
  it('inherits from SExpression', function () {
    this.footprint.should.be.an.instanceof(SExpression)
  })
  it('has expected content', function () {
    this.footprint.toString().should.match(/footprint/)
    this.footprint.toString().should.match(/smd_simple_sample/)
    this.footprint.toString().should.match(/\(attr smd\)/)
  })
  it('knows its name', function () {
    this.footprint.name.should.equal('smd_simple_sample')
  })
  it('use supplied lib name', function () {
    this.footprint.lib.should.equal('some_fp_collection')
  })
})

describe('fetchFootprint', function () {
  it('fetches string data from url', async function () {
    const footprint = await fetchFootprint('http://localhost:9876/footprints.pretty/smd_sample_footprint.kicad_mod')
    footprint.toString().should.match(/footprint/)
    footprint.toString().should.match(/smd_simple_sample/)
  })
  it('names object correctly', async function () {
    const footprint = await fetchFootprint('http://localhost:9876/footprints.pretty/smd_sample_footprint.kicad_mod')
    footprint.name.should.equal('smd_sample_footprint')
    footprint.lib.should.equal('footprints')
  })
  it('returns a Footprint object', async function () {
    const footprint = await fetchFootprint('http://localhost:9876/footprints.pretty/smd_sample_footprint.kicad_mod')
    footprint.should.be.an.instanceof(Footprint)
  })
})

describe('SExpression', function () {
  before(async function () {
    const pcbStr = await readFile('fixtures/sample/sample.kicad_pcb', 'utf8')
    const fpStr = await readFile('fixtures/sample/footprints.pretty/smd_simple_sample.kicad_mod', 'utf8')
    this.pcb = SExpression.fromString(pcbStr)
    this.fp = SExpression.fromString(fpStr)
  })

  it('parses input string', function () {
    const sexpr = SExpression.fromString('(this (is actually) (a valid) SExpression (with SoooperSecretData))')
    sexpr.toString().should.match(/\(with\s+SoooperSecretData\s*\)/)
  })
  it('parses sample files', function () {
    this.pcb.toString().should.match(/kicad_pcb/)
    this.pcb.toString().should.match(/Project Footprints:smd_simple_sample/)
    this.fp.toString().should.match(/smd_simple_sample/)
    this.fp.toString().should.match(/footprint/)
    this.fp.toString().should.match(/smd roundrect/)
  })
  it('gets type of sample files', function () {
    this.pcb.type().should.equal('kicad_pcb')
    this.fp.type().should.equal('footprint')
  })
  it('creates objects of correct class', function () {
    this.pcb.should.be.an.instanceof(SExpression)
    this.pcb.should.not.be.an.instanceof(Footprint)
    this.fp.should.be.an.instanceof(SExpression)
    this.fp.should.be.an.instanceof(Footprint)
  })
})

const footprintSamples = {
  smd: `(footprint "smd_sample_footprint" (version 20221018) (generator pcbnew)
  (layer "F.Cu")
  (attr smd)
  (fp_text reference "REF**" (at 0 -0.5 unlocked) (layer "F.SilkS")
      (effects (font (size 1 1) (thickness 0.1)))
    (tstamp 28bb948c-df91-4444-bb29-b2e4948a30c5)
  )
  (fp_text value "smd_simple_sample" (at 0 1 unlocked) (layer "F.Fab")
      (effects (font (size 1 1) (thickness 0.15)))
    (tstamp 8b284c51-9b71-4878-abfd-b18fb6a0dc57)
  )
  (fp_text user "\${REFERENCE}" (at 0 2.5 unlocked) (layer "F.Fab")
      (effects (font (size 1 1) (thickness 0.15)))
    (tstamp 477a2eba-da28-4612-868c-2b27268127c5)
  )
  (fp_line (start 4 -5) (end 3 -4)
    (stroke (width 0.1) (type default)) (layer "F.SilkS") (tstamp 6834140e-e027-4d3d-aca1-30471d1d72d0))
  (fp_line (start 4 -5) (end 4 -1)
    (stroke (width 0.1) (type default)) (layer "F.SilkS") (tstamp a9a34dcc-f7a3-434d-a39c-1176ff46ec94))
  (fp_line (start 4 -5) (end 5 -4)
    (stroke (width 0.1) (type default)) (layer "F.SilkS") (tstamp 1cb89df2-5bf8-4869-8640-f8846d913617))
  (fp_rect (start -7 -7) (end 7 7)
    (stroke (width 0.1) (type default)) (fill none) (layer "Dwgs.User") (tstamp fc1f7a90-2969-48b4-b094-4ee18a9a95c0))
  (pad "" np_thru_hole circle (at 0 0) (size 3 3) (drill 3) (layers "F&B.Cu" "*.Mask") (tstamp ebc311a7-54dd-4ffd-a047-443ccf5ca783))
  (pad "1" smd roundrect (at -5 -5) (size 2.286 1.524) (layers "F.Cu" "F.Paste" "F.Mask") (roundrect_rratio 0.25)
    (thermal_bridge_angle 45) (tstamp 2f6cbe45-c1ef-43b3-bf03-1e2190943c87))
  (pad "2" smd roundrect (at -5 5 90) (size 2.286 1.524) (layers "F.Cu" "F.Paste" "F.Mask") (roundrect_rratio 0.25)
    (thermal_bridge_angle 45) (tstamp 02f7c4a5-b539-4e67-8bec-0cabec2eb89a))
)
`,

  th: `(footprint "th_sample_footprint" (version 20221018) (generator pcbnew)
  (layer "F.Cu")
  (attr through_hole)
  (fp_text reference "REF**" (at 0 -0.5 unlocked) (layer "F.SilkS")
      (effects (font (size 1 1) (thickness 0.1)))
    (tstamp cb9a9db2-1357-4060-8e31-597efd5f1dca)
  )
  (fp_text value "th_simple_sample" (at 0 1 unlocked) (layer "F.Fab")
      (effects (font (size 1 1) (thickness 0.15)))
    (tstamp 08395301-b9a7-4dc1-b523-4bd2d0db0f75)
  )
  (fp_text user "\${REFERENCE}" (at 0 2.5 unlocked) (layer "F.Fab")
      (effects (font (size 1 1) (thickness 0.15)))
    (tstamp 7d54120c-9a9b-410b-8563-00051a27daee)
  )
  (fp_line (start 4 -5) (end 3 -4)
    (stroke (width 0.1) (type default)) (layer "F.SilkS") (tstamp 97d43a91-27f9-408d-b267-ae9bc899b8f9))
  (fp_line (start 4 -5) (end 4 -1)
    (stroke (width 0.1) (type default)) (layer "F.SilkS") (tstamp 32ac3a7b-7e4f-4a85-98ca-f2fb10f4eb10))
  (fp_line (start 4 -5) (end 5 -4)
    (stroke (width 0.1) (type default)) (layer "F.SilkS") (tstamp 86ce74e0-ede4-4179-bdf2-79071b86db19))
  (fp_rect (start -7 -7) (end 7 7)
    (stroke (width 0.1) (type default)) (fill none) (layer "Dwgs.User") (tstamp 824c3eb5-9948-44e8-b972-14d65f8bb549))
  (pad "" np_thru_hole circle (at 0 0) (size 3 3) (drill 3) (layers "F&B.Cu" "*.Mask") (tstamp e476c1c6-b381-46ad-a8a7-94af4e5ac989))
  (pad "1" thru_hole circle (at -5 -5) (size 2.2 2.2) (drill 1.5) (layers "*.Cu" "*.Mask") (tstamp 6f52fd49-ffd9-4489-b7a9-ffcfa35c99a2))
  (pad "2" thru_hole circle (at -5 5) (size 2.2 2.2) (drill 1.5) (layers "*.Cu" "*.Mask") (tstamp b30fe583-3011-4bb7-b9cb-805d198393a5))
)
`
}
