const fetch_text = require('./index.js').fetch_text
const footprint_samples = require('./fixtures/footprint_samples.js') 

const should = require('chai').should()

// set up test server to pull data from
const http = require('http');

const hostname = '127.0.0.1';
const port = 9876;

const server = http.createServer((req, res) => {
  let path = new URL(req.url, `http://${req.headers.host}`).pathname

  // allow tests to request sample footprint files
  let status = 200
  message = "Hello World\n"
  let match = path.match(/^\/fp\/(\w+)$/)
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
    let txt = await fetch_text('http://localhost:9876/fp/smd')
    txt.should.equal(footprint_samples.smd)
  })
})
