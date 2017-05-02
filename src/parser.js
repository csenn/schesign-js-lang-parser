import * as constants from './constants'

function _readContraint (tokenStream) {
  const constraintToken = tokenStream.next()
  if (constraintToken.type !== constants.VAR) {
    tokenStream.croak(constraintToken, `Value: "${constraintToken.value}" is invalid`)
  }

  const right = []

  const addConstraint = constraint => {
    if (constraint.type !== constants.STRING && constraint.type !== constants.NUM) {
      tokenStream.croak(constraint, `Value: "${constraint.value}" should be a string or number`)
    }
    right.push(constraint)
  }

  if (tokenStream.peek(1).value === '=') {
    /* Move past equals */
    tokenStream.next()

    const constraintValue = tokenStream.next()
    if (constraintValue.value === '[') {
      while (!tokenStream.eof()) {
        const next = tokenStream.next()
        if (next.value === ']') break
        if (next.value === ',') continue
        addConstraint(next)
      }
    } else {
      addConstraint(constraintValue)
    }
  }

  return {
    type: constants.ASSIGN,
    operator: '=',
    left: constraintToken,
    right: right
  }
}

function _readReference (tokenStream) {
  const labelToken = tokenStream.next()
  if (labelToken.type !== constants.VAR) {
    tokenStream.croak(labelToken, `Value: "${labelToken.value}" is invalid`)
  }

  const constraints = []
  while (!tokenStream.eof()) {
    const next = tokenStream.peek(1)
    if (next.type !== constants.VAR) break
    constraints.push(_readContraint(tokenStream))
  }

  return {
    type: constants.REFERENCE,
    label: labelToken,
    constraints: constraints
  }
}

function _readRow (tokenStream) {
  const labelToken = tokenStream.next()
  if (labelToken.type !== constants.VAR) {
    tokenStream.croak(labelToken, `Value: "${labelToken.value}" is invalid`)
  }

  const colonToken = tokenStream.next()
  if (colonToken.value !== ':') {
    tokenStream.croak(colonToken, `"${colonToken.value}" should be :`)
  }

  const right = []
  while (!tokenStream.eof()) {
    const next = tokenStream.peek(1)
    if (next.value === ';') {
      tokenStream.next()
      break
    }
    if (next.value === ',') {
      tokenStream.next()
      continue
    }
    if (next.type === constants.STRING) {
      right.push(tokenStream.next())
    } else if (next.type === constants.VAR) {
      right.push(_readReference(tokenStream))
    } else {
      tokenStream.croak(null, `${next.value} is invalid`)
    }
  }

  return {
    type: constants.ASSIGN,
    operator: ':',
    left: labelToken,
    right: right
  }
}

function _readBlock (tokenStream) {
  const blockToken = tokenStream.peek()
  if (blockToken.type !== constants.VAR) {
    tokenStream.croak(blockToken, `Value: "${blockToken.value}" is invalid`)
  }

  const labelToken = tokenStream.next()
  if (labelToken.type !== constants.VAR) {
    tokenStream.croak(labelToken, `${labelToken.value} is invalid`)
  }

  const bracketToken = tokenStream.next()
  if (bracketToken.value !== '{') {
    tokenStream.croak(bracketToken, `${bracketToken.value} should be a "{"`)
  }

  const body = []
  while (!tokenStream.eof()) {
    const next = tokenStream.peek(1)
    if (next.value === '}') {
      tokenStream.next()
      break
    }
    body.push(_readRow(tokenStream))
  }

  return {
    type: constants.BLOCK,
    label: labelToken,
    body: body
  }
}

export function parse (tokenStream) {
  const ast = []
  while (!tokenStream.eof()) {
    ast.push(_readBlock(tokenStream))
  }
  return ast
}
