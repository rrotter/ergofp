# moo.js lexer
@{%
  const moo = require("moo")
  const lexer = moo.compile({
    qword: {match: /"[^"]*"/, value: x => x.slice(1,-1)},
    kword: {match: /\(\s*[a-z0-9_]+\b/, value: x => x.slice(1).trim()},
    rp: ")",
    ws: {match: /\s+/, lineBreaks: true},
    uuid: /[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/,
    decimal: /\b-?\d+\.\d{1,6}\b/,
    int: /\b-?\d+\b/,
    word:  /[a-zA-Z0-9\-\._]+/,
  });
%}

@lexer lexer
# nearley.js grammar
root -> _ sexp _ {% function([,sexp,]) {return sexp} %}
sexp -> %kword tail _ %rp {% function([kword,tail,,]) {return {op: kword, args: tail}} %}
tail -> __ sexp tail {% function([,a,c]) {return [a, c].flat()} %} |
        __ atom tail {% function([,a,c]) {return [a, c].flat()} %} |
        null
atom -> %word | %qword | %int | %decimal | %uuid
__ -> %ws {% function() {return null} %}    # required whitespace
_  -> %ws {% function() {return null} %} |  # optional whitespace
     null {% function() {return null} %}
