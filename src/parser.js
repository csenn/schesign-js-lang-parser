import * as constants from './constants'

function _readContraint (tokenStream) {
  const constraintToken = tokenStream.next()
  if (constraintToken.type !== constants.VAR) {
    tokenStream.croak(constraintToken, `Value: "${constraintToken.value}" is invalid`)
  }

  const right = []

  const addConstraint = constraint => {
    const allowed = [constants.STRING, constants.NUM, constants.VAR]
    if (!allowed.includes(constraint.type)) {
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

/*
  something
  something minItems=2
  something required values=["hello", 3]
*/
function _readReference (tokenStream) {
  const labelToken = tokenStream.next()
  if (labelToken.type !== constants.VAR) {
    tokenStream.croak(labelToken, `Value: "${labelToken.value}" is invalid`)
  }
  const constraints = []
  while (!tokenStream.eof()) {
    const next = tokenStream.peek(1)
    // if (constants.VALID_ROW_TYPES.includes(next.value)) {
    //   tokenStream.croak(next, `Value: "${next.value}" shssould be ";"`)
    // }
    if (next.value === ',' || next.value === ';') {
      break
    }

    const validContraints = Object.keys(constants.VALID_CONTRAINT_TYPES)
    if (!validContraints.includes(next.value)) {
      tokenStream.croak(next, `Value: "${next.value}" must be one of ${validContraints.join(', ')}`)
    }
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

  if (!constants.VALID_ROW_TYPES.includes(labelToken.value)) {
    tokenStream.croak(labelToken, `"${labelToken.value}" must be one of: ${constants.VALID_ROW_TYPES.join(', ')}`)
  }

  const colonToken = tokenStream.next()
  if (colonToken.value !== ':') {
    tokenStream.croak(colonToken, `"${colonToken.value}" should be ":"`)
  }

  if (tokenStream.peek(1).value === ';') {
    tokenStream.croak(colonToken, 'A value must be provided')
  }

  let iteration = -1
  const right = []
  while (!tokenStream.eof()) {
    let next = tokenStream.peek(1)
    if (next.value === ';') {
      tokenStream.next()
      break
    }

    /* Multiple items are seperated by a comma */
    iteration++
    if (iteration > 0) {
      if (next.value !== ',') {
        tokenStream.croak(null, `"${next.value}" should be a comma or semi-colon`)
      }
      tokenStream.next()
      next = tokenStream.peek(1)
    }

    if (next.type === constants.STRING) {
      /* Can't have multiple strings in list */
      if (iteration > 0) {
        tokenStream.croak(null, `Can not have multiple strings`)
      }
      right.push(tokenStream.next())
    } else if (next.type === constants.VAR) {
      right.push(_readReference(tokenStream))
    } else {
      tokenStream.croak(null, `${next.value} is invalid. Missing a comma, equals, or semi-colon?`)
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
  const blockToken = tokenStream.next()
  if (blockToken.type !== constants.VAR) {
    tokenStream.croak(blockToken, `Value: "${blockToken.value}" is invalid`)
  }

  if (!constants.VALID_BLOCK_TYPES.includes(blockToken.value)) {
    tokenStream.croak(blockToken, `Value: "${blockToken.value}" is not "Class" or "Property"`)
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
    if (constants.VALID_BLOCK_TYPES.includes(next.value)) {
      tokenStream.croak(next, `"${next.value}" should be a "}"`)
    }
    body.push(_readRow(tokenStream))
  }

  return {
    type: constants.BLOCK,
    blockType: blockToken.value,
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
