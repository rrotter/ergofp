# moo.js lexer
@{%
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
    word: /[a-zA-Z0-9._-]+/,
  });
%}

# nearley.js grammar
@lexer lexer
root -> _ sexp _ {% function([,sexp,]) {return sexp} %}
sexp -> %kword tail _ %rp {% function([kword,tail,,]) {return {op: kword, args: tail}} %}
tail -> __ sexp tail {% function([,a,c]) {return [a, c].flat()} %} |
        __ atom tail {% function([,a,c]) {return [a, c].flat()} %} |
        null
atom -> %word | %qword | %int | %decimal | %uuid
__ -> %ws {% function() {return null} %}    # required whitespace
_  -> %ws {% function() {return null} %} |  # optional whitespace
     null {% function() {return null} %}
