import * as constants from './constants'

// export const DESCRIPTION = 'description'
// export const SUBCLASSOF = 'subClassOf'
// export const PROPERTIES = 'properties'

const classKeys = [
  constants.DESCRIPTION,
  constants.SUBCLASSOF,
  constants.PROPERTIES
]

function _splitRow (tokenStream, keys) {
  const tokens = []
  const keyToken = tokenStream.peek()
  if (!keyToken.type === constants.VAR) {
    tokenStream.croak(keyToken, `Type: ${keyToken.type} shoud be be VAR`)
  }
  if (!keys.inludes(keyToken.value)) {
    tokenStream.croak(keyToken, `Type: ${keyToken.value} must be one of ${keys}`)
  }
  const colonToken = tokenStream.next()
  if (colonToken.val !== ':') {
    tokenStream.croak(keyToken, `Missing colon`)
  }
  while (tokenStream.next() !== ';') {
    tokens.push(tokenStream.peek())
  }
  return { key: keyToken.value, tokens }
}

function _readNode (tokenStream, keys) {
  const labelToken = tokenStream.next()
  const rows = {}

  const bracketToken = tokenStream.next()
  if (bracketToken.value !== '{') {
    tokenStream.croak(bracketToken, 'This should be a {')
  }

  while (tokenStream.next().value !== '}') {
    const row = _splitRow(tokenStream, keys)
    if (rows[row.key]) {
      tokenStream.croak('Should not declare ')
    }

    { Object.assign(rows, row) }
  }

  return {
    labelToken: labelToken,
    rows
  }
}

function _readClass (tokenStream) {
  const { labelToken, rows } = _readNode(tokenStream, classKeys)
  // const rows = _readRows(tokenStream, classKeys)
}

export function parse (tokenStream) {
  while (!tokenStream.eof()) {
    const current = tokenStream.peek()
    if (current.type !== constants.VAR) {
      tokenStream.croak(current, `Token type: ${current.type} is not VAR`)
    }
    if (current.value === constants.CLASS) {
      _readClass(tokenStream)
    } else if (current.value === constants.PROPERTY) {

    } else {
      tokenStream.croak(current, `Value: ${current.value} is not "Class" or "Property"`)
    }
  }
}

// export default class Parser {
//   constructor (tokenStream) {
//     this.tokenStream = tokenStream
//   }

// }
