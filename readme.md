## ergofp
WIP to for working with KiCad footprints

So far this repo consists of:
- Sample KiCad data for testing and development
- Stubs for testing in Node.js

### To do:
- Fetch and parse KiCad 7 Footprints (we can fetch them, but… so can curl)
- Dump internal representation of KiCad Footprint to json/yaml
- Dump internal representation of KiCad Footprint back to KiCad S-expr
- Test loading files in a web browser, with a trivial client side app
  - `subtree` common footprints
  - experiment with `access-control-allow-origin` (CORS) on GitHub pages for external hosting of alternative footprints
