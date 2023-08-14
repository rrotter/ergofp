## ergofp
Parses any KiCad s-expression into a object tree for practiacal manipulation.

## development
Install dependencies: `npm ci`

Run tests: `npm test`

Lint: `npx run lint[:fix]`

Compile sexpr parser: `npm run nearleyc`

Test s-expression parsing pipeline:
- `./demo.js fixtures/sample/footprints.pretty/th_simple_sample.kicad_mod`
- `./demo.js fixtures/sample/sample.kicad_pcb`

### To do:
- add basic manipulation to Footprint
  - rotation
  - translation
  - stamping w/ PCB data
- generate demo kicad_pcb
  - headers
  - insert footprints
  - add nets
- generate kicad_pcb using ergogen points data
- Test loading files in a web browser, via client side js
  - `subtree` common footprints
  - experiment with `access-control-allow-origin` (CORS) on GitHub pages for external hosting of alternative footprints
