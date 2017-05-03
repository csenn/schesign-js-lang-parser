import { croak, checkClassReference, checkPropertyReference} from './utils'
import * as constants from '../constants'

function _processPropertyConstraints (referenceNode, constraints) {
  const result = {}
  if ('required' in constraints) {
    if ('minItems' in constraints) {
      croak(referenceNode, '"required" and "minItems" can not be used together')
    }
    result.minItems = 1
  }
  if ('array' in constraints) {
    if ('maxItems' in constraints) {
      croak(referenceNode, '"array" and "maxItems" can not be used together')
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
      croak(referenceNode, `"${label}" is invalid. Can only be one of ${allowed.join(', ')}`)
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
      croak(referenceNode, `${label} is a duplicated constraint`)
    }
    prev[label] = value
    return prev
  }, {})
}

function _getRange (context, ast) {
  if (ast.length === 0 || ast[0].type !== 'reference' || ast.length > 1) {
    croak(ast && ast[0], 'Range should be a single reference')
  }
  const astRange = ast[0]
  const label = astRange.label.value

  const validRanges = Object.keys(constants.RANGE_PARENT_MAPPING)
  if (!validRanges.includes(label)) {
    croak(astRange, `Invalid range type "${label}." Must be one of ${validRanges.join(', ')}`)
  }

  const type = constants.RANGE_PARENT_MAPPING[label]
  const validConstraints = constants.VALID_RANGE_CONSTRAINTS[type]
  const reduced = _reduceConstraints(astRange, validConstraints)
  // _processRangeConstraints(astRange, reduced)

  const range = Object.assign(reduced, { type })

  if (label !== type) {
    range.format = label
  }

  if (range.type === 'LinkedClass') {
    checkClassReference(context, range.ref, ast[0])
  }

  // const err = validateRange(range)
  // if (err) {
  //   croak(astRange, `Invalid range: ${err}`)
  // }

  return range
}

function _getPropertySpecs (context, ast) {
  if (!ast || ast.length === 0) {
    return []
  }
  return ast.map(node => {
    if (node.type !== constants.REFERENCE) {
      croak(node, 'Must be a valid property reference')
    }
    const reduced = _reduceConstraints(node, constants.VALID_PROPERTY_CONSTRAINTS)
    const constraints = _processPropertyConstraints(node, reduced)
    const ref = node.label.value
    checkPropertyReference(context, ref, node)
    return Object.assign(constraints, { ref })
  })
}

function _getSubClassOf (context, ast) {
  if (ast.length === 0 || ast[0].type !== 'reference' || ast.length > 1) {
    croak(ast && ast[0], 'SubClassOf should be a single reference')
  }
  const subClassOf = ast[0].label.value
  checkClassReference(context, subClassOf, ast[0])
  return subClassOf
}

function _getDescription (context, ast) {
  if (ast.length === 0 || ast[0].type !== 'str' || ast.length > 1) {
    croak(ast && ast[0], 'Description should be a single string')
  }
  return ast[0].value
}

export const transformBodyMap = {
  description: _getDescription,
  subClassOf: _getSubClassOf,
  properties: _getPropertySpecs,
  range: _getRange
}
