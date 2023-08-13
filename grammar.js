// Generated automatically by nearley, version 2.20.1
// http://github.com/Hardmath123/nearley
(function () {
function id(x) { return x[0]; }

  const moo = require("moo")
  const lexer = moo.compile({
    // quoted word ends with the first " NOT preceded by a backslash
    //   - no newlines (\n or \r)
    qword: {match: /"(?:[^"\n\r\\]|\\[^\n\r])*"/},
    // keyword opens an s-expression
    //   - we grab the '(' as part of kword to reduce ambiguity
    //   - all known keywords are lower case
    kword: {match: /\(\s*[a-z0-9_]+\b/, value: x => x.slice(1).trim()},
    rp: ")",
    ws: {match: /\s+/, lineBreaks: true},
    uuid: /[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/,
    // max 6 places right of decimal
    decimal: /\b-?\d+\.\d{1,6}\b/,
    int: /\b-?\d+\b/,
    word: /[a-zA-Z0-9\-\._]+/,
  });
var grammar = {
    Lexer: lexer,
    ParserRules: [
    {"name": "root", "symbols": ["_", "sexp", "_"], "postprocess": function([,sexp,]) {return sexp}},
    {"name": "sexp", "symbols": [(lexer.has("kword") ? {type: "kword"} : kword), "tail", "_", (lexer.has("rp") ? {type: "rp"} : rp)], "postprocess": function([kword,tail,,]) {return {op: kword, args: tail}}},
    {"name": "tail", "symbols": ["__", "sexp", "tail"], "postprocess": function([,a,c]) {return [a, c].flat()}},
    {"name": "tail", "symbols": ["__", "atom", "tail"], "postprocess": function([,a,c]) {return [a, c].flat()}},
    {"name": "tail", "symbols": []},
    {"name": "atom", "symbols": [(lexer.has("word") ? {type: "word"} : word)]},
    {"name": "atom", "symbols": [(lexer.has("qword") ? {type: "qword"} : qword)]},
    {"name": "atom", "symbols": [(lexer.has("int") ? {type: "int"} : int)]},
    {"name": "atom", "symbols": [(lexer.has("decimal") ? {type: "decimal"} : decimal)]},
    {"name": "atom", "symbols": [(lexer.has("uuid") ? {type: "uuid"} : uuid)]},
    {"name": "__", "symbols": [(lexer.has("ws") ? {type: "ws"} : ws)], "postprocess": function() {return null}},
    {"name": "_", "symbols": [(lexer.has("ws") ? {type: "ws"} : ws)], "postprocess": function() {return null}},
    {"name": "_", "symbols": [], "postprocess": function() {return null}}
]
  , ParserStart: "root"
}
if (typeof module !== 'undefined'&& typeof module.exports !== 'undefined') {
   module.exports = grammar;
} else {
   window.grammar = grammar;
}
})();
