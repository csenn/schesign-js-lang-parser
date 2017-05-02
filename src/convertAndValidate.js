import * as constants from './constants'

function addError (context, astNode, message) {
  // console.log(astNode)
  context.errors.push({
    message,
    start: astNode.start,
    end: astNode.end
  })
}

function getValue (astNode, key, required) {
  const value = astNode[key] && astNode[key].value
  if (!value && required) {
    throw new Error('aabba')
  }
  return value
}

function getCommonData (astNode) {
  return {
    label: getValue(astNode, 'label', true),
    description: getValue(astNode, 'description') || undefined
  }
}

/*
  Should always have token, lets be safe though
  In several cases the location information exists
  in the label, lets check both spots
*/
function _croak (nodeOrToken, message) {
  let result = ''
  if (nodeOrToken) {
    const token = nodeOrToken.label || nodeOrToken
    const { line, col } = token.start
    result += `[line: ${line} col: ${col}] `
  }
  throw new Error(`${result}${message}`)
}

function _processPropertyConstraints (referenceNode, constraints) {
  const result = {}
  if ('required' in constraints) {
    if ('minItems' in constraints) {
      _croak(referenceNode, '"required" and "minItems" can not be used together')
    }
    result.minItems = 1
  }
  if ('array' in constraints) {
    if ('maxItems' in constraints) {
      _croak(referenceNode, '"array" and "maxItems" can not be used together')
    }
    result.maxItems = 'null'
  }
  if (constraints.minItems) {
    result.minItems = parseInt(constraints.minItems)
  }
  if (constraints.maxItems) {
    result.maxItems = parseInt(constraints.maxItems)
  }
  return result
}

/* Reach in and grab the contraints we need */
function _reduceConstraints (referenceNode, allowed) {
  return referenceNode.constraints.reduce((prev, constraint) => {
    const label = constraint.left.value
    if (!allowed.includes(label)) {
      _croak(referenceNode, `"${label}" is invalid. Can only be one of ${allowed.join(', ')}`)
    }
    let value
    if (constraint.right.length === 0) {
      value = true
    } else if (constraint.right.length === 1) {
      value = constraint.right[0].value
    } else {
      value = constraint.right.map(r => r.value)
    }
    if (prev[label]) {
      _croak(referenceNode, `${label} is a duplicated constraint`)
    }
    prev[label] = value
    return prev
  }, {})
}

function _getPropertySpecs (ast) {
  if (!ast || ast.length === 0) {
    return []
  }
  return ast.map(node => {
    if (node.type !== constants.REFERENCE) {
      _croak(node, 'Must be a valid property reference')
    }
    const reduced = _reduceConstraints(node, constants.VALID_PROPERTY_CONSTRAINTS)
    const constraints = _processPropertyConstraints(node, reduced)
    return Object.assign(constraints, {
      ref: getValue(node, 'label', true)
    })
  })
}

function _getDescription (ast) {
  if (ast.length === 0 || ast.length > 1) {
    /* Should not make it into this one with the parser */
    _croak(ast && ast[0], 'Description should be a single string')
  }
  if (ast[0].type !== 'str') {
    _croak(ast[0], 'Description should be a single string')
  }
  return ast[0].value
}

function _getSubClassOf (ast) {
  if (ast.length === 0) {
    _croak(ast && ast[0], 'SubClassOf should be a single reference')
  }
  const node = ast[0]
  if (ast.length > 1 || node.type !== 'reference') {
    _croak(node, 'SubClassOf should be a single reference')
  }
  return node.label.value
}

const _convertRows = {
  description: _getDescription,
  subClassOf: _getSubClassOf,
  properties: _getPropertySpecs
}

function _getPropertyNode (context, astNode) {
  const node = Object.assign({type: 'Property'}, getCommonData(astNode))
  return node
}

function _getClassNode (context, astNode) {
  const classNode = {
    type: 'Class',
    label: getValue(astNode, 'label', true)
  }

  astNode.body.forEach(row => {
    const type = row.left.value
    if (classNode[type]) {
      throw new Error('type already added')
    }
    classNode[type] = _convertRows[type](row.right)
  })

  // const node = Object.assign({type: 'Class'}, getCommonData(astNode))
  // node.propertySpecs = getPropertySpecs(context, astNode)
  return classNode
}

export default function (ast) {
  const graph = []

  const context = {
    classes: {},
    properties: {},
    errors: []
  }

  ast.forEach(astNode => {
    const func = astNode.blockType === constants.CLASS ? _getClassNode : _getPropertyNode
    graph.push(func(context, astNode))
  })

  if (context.errors.length) {
    const error = context.errors[0]
    const {line, col} = error.start
    const message = `[line: ${line} col: ${col}] ${error.message}`
    throw new Error(message)
  }
  console.log(graph)

  return graph
}
