## ergofp
WIP to for working with KiCad footprints

So far this repo consists of:
- Sample KiCad data for testing and development
- Fetch footprints from URL
- Tests for everything that it can do so far
- Parser for KiCad s-expression

## development
Install dependencies: `npm ci`

Run tests: `npm test`
Compile sexpr parser: `npm run nearleyc`

### To do:
- Parse KiCad 7 Footprints
- Dump internal representation of KiCad Footprint to json/yaml
- Dump internal representation of KiCad Footprint back to KiCad S-expr
- Test loading files in a web browser, with a trivial client side app
  - `subtree` common footprints
  - experiment with `access-control-allow-origin` (CORS) on GitHub pages for external hosting of alternative footprints
