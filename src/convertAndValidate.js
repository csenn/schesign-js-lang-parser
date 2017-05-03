import PositionError from './PositionError'
import * as constants from './constants'
import {validateRange} from 'schesign-js-graph-utils/dist/validate'

function getValue (astNode, key, required) {
  const value = astNode[key] && astNode[key].value
  if (!value && required) {
    throw new Error('aabba')
  }
  return value
}

/*
  Should always have token, lets be safe though
  In several cases the location information exists
  in the label, lets check both spots
*/
function _croak (nodeOrToken, message) {
  const token = nodeOrToken.label || nodeOrToken
  const { line, col } = token.start
  const position = { start: token.start, end: token.end }
  throw new PositionError(`Line ${line}, Col ${col} ${message}`, position)
}

// function _processRangeConstraints (referenceNode, constraints) {
//   Object.keys(constraints).forEach(key => {
//     const func = constants.VALID_CONTRAINT_TYPES[key]
//     const values = Array.isArray(constraints[key]) ? constraints[key] : [constraints[key]]
//     values.forEach(value => {
//       if (!func(value)) _croak(referenceNode, `Invalid type for constraint ${value}`)
//     })
//   })
// }

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
    result.maxItems = null
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
    if (prev[label] !== null && prev[label] !== undefined) {
      _croak(referenceNode, `${label} is a duplicated constraint`)
    }
    prev[label] = value
    return prev
  }, {})
}

function _getRange (ast) {
  if (ast.length === 0 || ast[0].type !== 'reference' || ast.length > 1) {
    _croak(ast && ast[0], 'Range should be a single reference')
  }
  const astRange = ast[0]
  const label = getValue(astRange, 'label', true)

  const validRanges = Object.keys(constants.RANGE_PARENT_MAPPING)
  if (!validRanges.includes(label)) {
    _croak(astRange, `Invalid range type "${label}." Must be one of ${validRanges.join(', ')}`)
  }

  const type = constants.RANGE_PARENT_MAPPING[label]
  const validConstraints = constants.VALID_RANGE_CONSTRAINTS[type]
  const reduced = _reduceConstraints(astRange, validConstraints)
  // _processRangeConstraints(astRange, reduced)

  const range = Object.assign(reduced, { type })

  if (label !== type) {
    range.format = label
  }

  // const err = validateRange(range)
  // if (err) {
  //   _croak(astRange, `Invalid range: ${err}`)
  // }

  return range
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
  if (ast.length === 0 || ast[0].type !== 'str' || ast.length > 1) {
    _croak(ast && ast[0], 'Description should be a single string')
  }
  return ast[0].value
}

function _getSubClassOf (ast) {
  if (ast.length === 0 || ast[0].type !== 'reference' || ast.length > 1) {
    _croak(ast && ast[0], 'SubClassOf should be a single reference')
  }
  return ast[0].label.value
}

const _convertRows = {
  description: _getDescription,
  subClassOf: _getSubClassOf,
  properties: _getPropertySpecs,
  range: _getRange
}

function _getNode (astNode, rowTypes) {
  const node = {
    label: getValue(astNode, 'label', true)
  }

  astNode.body.forEach(row => {
    const rowKey = row.left.value
    if (!rowTypes.includes(rowKey)) {
      _croak(row.left, `"${rowKey}" is invalid in this block`)
    }
    if (rowKey in node) {
      _croak(row.left, `"${rowKey}" is declared multiple times in this block`)
    }
    node[rowKey] = _convertRows[rowKey](row.right)
  })

  return node
}

function _getClassNode (astNode) {
  const node = _getNode(astNode, constants.VALID_CLASS_ROW_TYPES)
  if (node.properties) {
    node.propertySpecs = node.properties
    delete node.properties
  }
  return Object.assign(node, {type: 'Class'})
}

function _getPropertyNode (astNode) {
  const node = _getNode(astNode, constants.VALID_PROPERTY_ROW_TYPES)
  /* We move the properties into the range here. A bit wierd, but clean enough */
  if (node.range.type === 'NestedObject') {
    node.range.propertySpecs = node.properties
    delete node.properties
  }
  return Object.assign(node, {type: 'Property'})
}

export default function (ast) {
  const graph = []

  const context = {
    classes: {},
    properties: {},
    errors: []
  }

  ast.forEach(astNode => {
    const func = astNode.blockType === constants.CLASS
      ? _getClassNode
      : _getPropertyNode

    // graph.push(Object.assign({type: astNode.blockType}, _getNode(astNode, rowTypes)))

    // const func = astNode.blockType === constants.CLASS ? _getClassNode : _getPropertyNode
    graph.push(func(astNode))
  })

  if (context.errors.length) {
    const error = context.errors[0]
    const {line, col} = error.start
    const message = `[line: ${line} col: ${col}] ${error.message}`
    throw new Error(message)
  }
  // console.log(graph)

  return graph
}
