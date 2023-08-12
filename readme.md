## ergofp
WIP to for working with KiCad footprints

So far this repo consists of:
- Sample KiCad data for testing and development
- Fetch footprints from URL
- Tests!
- Parser for KiCad s-expression - can parse any KiCad pcb (.kicad_pcb) or footprint (.kicad_mod)
- proof of concept of round-trip printing parsed data as an s-expression

## development
Install dependencies: `npm ci`

Run tests: `npm test`
Compile sexpr parser: `npm run nearleyc`

### To do:
- object representation of s-expressions, footprints
- generate demo kicad_pcb from footprints
- generate kicad_pcb using ergogen points data
- Test loading files in a web browser, via client side js
  - `subtree` common footprints
  - experiment with `access-control-allow-origin` (CORS) on GitHub pages for external hosting of alternative footprints
- ...!?