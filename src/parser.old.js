import * as constants from './constants'

const classKeys = {
  [constants.DESCRIPTION]: true,
  [constants.SUBCLASSOF]: true,
  [constants.PROPERTIES]: true
}

const propertyKeys = {
  [constants.DESCRIPTION]: true,
  [constants.SUBCLASSOF]: true,
  [constants.PROPERTIES]: true,
  [constants.RANGE]: true
}

const propertyContraints = {
  [constants.PROPERTY_REQUIRED]: true,
  [constants.PROPERTY_MIN_ITEMS]: true,
  [constants.PROPERTY_MAX_ITEMS]: true,
  [constants.PROPERTY_ARRAY]: true,
  [constants.PROPERTY_INDEX]: true
}

const rangeContraints = {
  [constants.RANGE_VALUES]: true,
  [constants.RANGE_MIN]: true,
  [constants.RANGE_MAX]: true,
  [constants.RANGE_REGEX]: true
}

function _readConstraintRow (tokenStream, tokens, constraintMap) {
  const refToken = tokens[0]
  if (refToken.type !== constants.VAR) {
    tokenStream.croak(refToken, `"${refToken.value}" must be a property reference`)
  }
  const property = {
    ref: refToken,
    constraints: []
  }

  /* Read constraint tokens */
  for (let i = 1; i < tokens.length; i++) {
    const constraintToken = tokens[i]
    if (!constraintMap[constraintToken.value]) {
      tokenStream.croak(constraintToken, `"${constraintToken.value}" must be one of: ${Object.keys(constraintMap).join(', ')}`)
    }
    const constraint = {
      left: constraintToken
    }
    const equalsToken = tokens[i + 1]
    if (equalsToken && equalsToken.value === '=') {
      const constraintValueToken = tokens[i + 2]
      if (!constraintValueToken || constraintValueToken.type !== constants.STRING) {
        tokenStream.croak(equalsToken, `"${equalsToken.value}" must be followed by a valid constraint`)
      }
      constraint.right = constraintValueToken
      /* Skip = and constraintValue tokens here */
      i += 2
    }
    property.constraints.push(constraint)
  }

  return property
}

function _readProperties (tokenStream, row) {
  const { tokens } = row
  let index = 0
  const constraintRows = []
  for (const token of tokens) {
    if (token.value === ',') {
      index++
      continue
    }
    if (!constraintRows[index]) {
      constraintRows[index] = []
    }
    constraintRows[index].push(token)
  }

  return constraintRows.map(tokens => _readConstraintRow(tokenStream, tokens, propertyContraints))
}

function _readRange (tokenStream, row) {
  return _readConstraintRow(tokenStream, row.tokens, rangeContraints)
}

function _readSubClassOf (tokenStream, row) {
  const { keyToken, tokens } = row
  if (Array.isArray(tokens) && tokens.length === 1 && tokens[0].type === constants.VAR) {
    return tokens[0]
  }
  tokenStream.croak(keyToken, 'SubClassOf should be another class')
}

function _readDescription (tokenStream, row) {
  const { keyToken, tokens } = row
  if (Array.isArray(tokens) && tokens.length === 1 && tokens[0].type === constants.STRING) {
    return tokens[0]
  }
  tokenStream.croak(keyToken, 'Description should be a single text string in "double quotes"')
}

const _readRows = {
  description: _readDescription,
  subClassOf: _readSubClassOf,
  properties: _readProperties,
  range: _readRange
}

/*
  takes a row like this (except in tokenized form)
  description: 'hello';
  and returns
  {key: 'description', tokens: [ {type: STR, value: 'hello'} ]}
  This handles valid keys names, colon start, and semi-colon finish
*/
function _prepareRow (tokenStream, nodeKeys) {
  const tokens = []

  /* Get the nodeKey token */
  const keyToken = tokenStream.peek()
  if (!keyToken.type === constants.VAR || !nodeKeys[keyToken.value]) {
    tokenStream.croak(keyToken, `"${keyToken.value}" must be one of ${Object.keys(nodeKeys).join(', ')}`)
  }

  /* Should be the colon token */
  const colonToken = tokenStream.next()
  if (colonToken.value !== ':') {
    tokenStream.croak(keyToken, `"${colonToken.value}" should be ":"`)
  }

  /* Loop until semi-colon */
  while (!tokenStream.eof() && tokenStream.next().value !== ';') {
    const next = tokenStream.peek()
    const nextNext = tokenStream.peek(1)
    /* semi-colon is missing */
    if (next.value === '}' || nextNext.value === ':') {
      tokenStream.croak(next, 'Missing ";"')
    }
    tokens.push(tokenStream.peek())
  }

  return { keyToken: keyToken, tokens }
}

function _reduceNodeRows (tokenStream, nodeKeys) {
  const obj = {}
  while (!tokenStream.eof() && tokenStream.next().value !== '}') {
    const row = _prepareRow(tokenStream, nodeKeys)
    const rowKey = row.keyToken.value
    if (obj[rowKey]) {
      tokenStream.croak(tokenStream.peek(), `Should not declare "${rowKey}" multiple times`)
    }
    Object.assign(obj, {[rowKey]: row})
  }
  return obj
}

function _readNode (tokenStream, nodeKeys) {
  const labelToken = tokenStream.next()
  if (labelToken.type !== constants.VAR) {
    tokenStream.croak(labelToken, `${labelToken.value} is invalid`)
  }

  const node = { label: labelToken }

  const bracketToken = tokenStream.next()
  if (bracketToken.value !== '{') {
    tokenStream.croak(bracketToken, `${bracketToken.value} should be a {`)
  }

  /* A map with nodeKeys and tokens prepared to be read */
  const rowMap = _reduceNodeRows(tokenStream, nodeKeys)

  Object.keys(nodeKeys).forEach(key => {
    const row = rowMap[key]
    if (row) {
      Object.assign(node, {
        [key]: _readRows[key](tokenStream, row)
      })
    }
  })

  const closingBracketToken = tokenStream.peek()
  if (!closingBracketToken || closingBracketToken.value !== '}') {
    tokenStream.croak(closingBracketToken, `${closingBracketToken.value} should be a }`)
  }

  /* Move past closing bracket */
  tokenStream.next()
  return node
}

export function parse (tokenStream) {
  const ast = []
  while (!tokenStream.eof()) {
    const nodeToken = tokenStream.peek()
    if (nodeToken.type === constants.VAR) {
      if (nodeToken.value === constants.CLASS) {
        ast.push(Object.assign({_type: constants.CLASS}, _readNode(tokenStream, classKeys)))
        continue
      } else if (nodeToken.value === constants.PROPERTY) {
        ast.push(Object.assign({_type: constants.PROPERTY}, _readNode(tokenStream, propertyKeys)))
        continue
      }
    }
    tokenStream.croak(nodeToken, `Value: "${nodeToken.value}" is not "Class" or "Property"`)
  }
  return ast
}
