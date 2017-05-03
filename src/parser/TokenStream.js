import PositionError from '../PositionError'
import { VAR, PUNC, STRING, NUM } from '../constants'

const isWhitespace = char => ' \t\n'.indexOf(char) >= 0
const isVariable = char => /[a-z0-9_/.]/i.test(char)
const isPunc = char => '{}:;[]=,'.indexOf(char) >= 0
const isInString = char => char !== '"'
const isInComment = char => char !== '\n'

/* http://lisperator.net/pltut/parser/the-ast */
export default class TokenStream {
  constructor (inputStream) {
    this._inputStream = inputStream
    this._tokens = []
    this._currentIndex = -1 // First call to next should return 0th index
  }
  _addToken (type, value) {
    const startPos = this._inputStream.pos - value.toString().length
    const endPos = this._inputStream.pos
    this._tokens.push({
      type,
      value,
      start: {
        pos: startPos,
        line: this._inputStream.posMap[startPos].line,
        col: this._inputStream.posMap[startPos].col
      },
      end: {
        pos: endPos,
        line: this._inputStream.posMap[endPos].line,
        col: this._inputStream.posMap[endPos].col
      }
    })
  }
  _readWhile (predicate) {
    let str = ''
    while (!this._inputStream.eof() && predicate(this._inputStream.peek())) {
      str += this._inputStream.peek()
      this._inputStream.next()
    }
    return str
  }
  _readPunc () {
    const puncToken = this._inputStream.peek()
    this._inputStream.next()
    this._addToken(PUNC, puncToken)
  }
  _readVariable () {
    const str = this._readWhile(isVariable)
    if (/^\d*\.?\d*$/.test(str)) {
      this._addToken(NUM, parseFloat(str))
    } else {
      this._addToken(VAR, str)
    }
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
  peek (ahead = 0) {
    return this._tokens[this._currentIndex + ahead] || {}
  }
  next () {
    this._currentIndex++
    return this._tokens[this._currentIndex] || {}
  }
  eof () {
    return this._currentIndex >= this._tokens.length - 1
  }
  croak (token, message) {
    const errorToken = token ||
      this._tokens[this._currentIndex] ||
      this._tokens[this._tokens.length - 1]
    const { line, col } = errorToken.start
    const position = { start: errorToken.start, end: errorToken.end }
    throw new PositionError(`Line ${line}, Col ${col} ${message}`, position)
  }
}
