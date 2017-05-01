import { VAR, PUNC, STRING } from './constants'

const isWhitespace = char => ' \t\n'.indexOf(char) >= 0
const isVariable = char => /[a-z0-9_/.]/i.test(char)
const isPunc = char => '{}:;[]='.indexOf(char) >= 0
const isInString = char => char !== '"'
const isInComment = char => char !== '\n'

/* http://lisperator.net/pltut/parser/the-ast */
export default class TokenStream {
  constructor (inputStream) {
    this._inputStream = inputStream
    this._tokens = []
    this._currentIndex = 0
  }
  _addToken (type, value) {
    this._tokens.push({
      type,
      value,
      position: {
        start: this._inputStream.pos - value.length,
        end: this._inputStream.pos
      }
    })
  }
  _readWhile (predicate) {
    let str = ''
    while (!this._inputStream.eof() && predicate(this._inputStream.peek())) {
      str += this._inputStream.next()
    }
    return str
  }
  _readPunc () {
    this._addToken(PUNC, this._inputStream.peek())
    this._inputStream.next()
  }
  _readVariable () {
    const str = this._readWhile(isVariable)
    this._addToken(VAR, str)
  }
  _readString () {
    this._inputStream.next()
    const str = this._readWhile(isInString)
    this._inputStream.next()
    this._addToken(STRING, str)
  }
  _readComment () {
    this._readWhile(isInComment)
    this._inputStream.next()
  }
  _readWhitespace () {
    this._readWhile(isWhitespace)
  }
  read () {
    while (!this._inputStream.eof()) {
      const char = this._inputStream.peek()
      if (isWhitespace(char)) {
        this._readWhitespace()
        continue
      }
      if (char === '#') {
        this._readComment()
        continue
      }
      if (char === '"') {
        this._readString()
        continue
      }
      if (isVariable(char)) {
        this._readVariable()
        continue
      }
      if (isPunc(char)) {
        this._readPunc()
        continue
      }
      this._inputStream.croak(`Was not expecting char ${char}`)
    }
  }
  peek () {
    return this._tokens[this._currentIndex]
  }
  next () {
    return this._tokens[this._currentIndex++]
  }
  eof () {
    return this._currentIndex >= this._tokens.length
  }
  croak (token, message) {
    const { line, col } = this._inputStream.posMap[token.position.start]
    throw new Error(`Line: ${line} col: ${col}. ${message}`)
  }
}

// function TokenStream (input) {
//   var current = null
//   var keywords = ' if then else lambda λ true false '
//   return {
//     next: next,
//     peek: peek,
//     eof: eof,
//     croak: input.croak
//   }
//   function is_keyword (x) {
//     return keywords.indexOf(' ' + x + ' ') >= 0
//   }
//   function is_digit (ch) {
//     return /[0-9]/i.test(ch)
//   }
//   function is_id_start (ch) {
//     return /[a-zλ_]/i.test(ch)
//   }
//   function is_id (ch) {
//     return is_id_start(ch) || '?!-<>=0123456789'.indexOf(ch) >= 0
//   }
//   function is_op_char (ch) {
//     return '+-*/%=&|<>!'.indexOf(ch) >= 0
//   }
//   function is_punc (ch) {
//     return ',;(){}[]'.indexOf(ch) >= 0
//   }
//   function is_whitespace (ch) {
//     return ' \t\n'.indexOf(ch) >= 0
//   }
//   function read_while (predicate) {
//     var str = ''
//     while (!input.eof() && predicate(input.peek())) { str += input.next() }
//     return str
//   }
//   function read_number () {
//     var has_dot = false
//     var number = read_while(function (ch) {
//       if (ch == '.') {
//         if (has_dot) return false
//         has_dot = true
//         return true
//       }
//       return is_digit(ch)
//     })
//     return { type: 'num', value: parseFloat(number) }
//   }
//   function read_ident () {
//     var id = read_while(is_id)
//     return {
//       type: is_keyword(id) ? 'kw' : 'var',
//       value: id
//     }
//   }
//   function read_escaped (end) {
//     var escaped = false, str = ''
//     input.next()
//     while (!input.eof()) {
//       var ch = input.next()
//       if (escaped) {
//         str += ch
//         escaped = false
//       } else if (ch == '\\') {
//         escaped = true
//       } else if (ch == end) {
//         break
//       } else {
//         str += ch
//       }
//     }
//     return str
//   }
//   function read_string () {
//     return { type: 'str', value: read_escaped('"') }
//   }
//   function skip_comment () {
//     read_while(function (ch) { return ch != '\n' })
//     input.next()
//   }
//   function read_next () {
//     read_while(is_whitespace)
//     if (input.eof()) return null
//     var ch = input.peek()
//     if (ch == '#') {
//       skip_comment()
//       return read_next()
//     }
//     if (ch == '"') return read_string()
//     if (is_digit(ch)) return read_number()
//     if (is_id_start(ch)) return read_ident()
//     if (is_punc(ch)) {
//       return {
//         type: 'punc',
//         value: input.next()
//       }
//     }
//     if (is_op_char(ch)) {
//       return {
//         type: 'op',
//         value: read_while(is_op_char)
//       }
//     }
//     input.croak("Can't handle character: " + ch)
//   }
//   function peek () {
//     return current || (current = read_next())
//   }
//   function next () {
//     var tok = current
//     current = null
//     return tok || read_next()
//   }
//   function eof () {
//     return peek() == null
//   }
// }
