import {croak, checkClassReference, checkPropertyReference} from './utils'
import * as constants from '../constants'

// function _exludeParentProperties (referenceNode) {

// }

function _processPropertyConstraints (referenceNode, constraints) {
  const propertySpec = {}

  if ('required' in constraints) {
    propertySpec.required = true
  }

  if ('array' in constraints) {
    propertySpec.array = true
  }

  if ('primaryKey' in constraints) {
    propertySpec.primaryKey = true
  }

  if ('index' in constraints) {
    propertySpec.index = true
  }

  if ('unique' in constraints) {
    propertySpec.unique = true
  }

  if ('minItems' in constraints) {
    if (!propertySpec.array) {
      croak(referenceNode, '"minItems" can only be used with "array"')
    }
    propertySpec.minItems = parseInt(constraints.minItems)
  }

  if ('maxItems' in constraints) {
    if (!propertySpec.array) {
      croak(referenceNode, '"maxItems" can only be used with "array"')
    }
    propertySpec.maxItems = parseInt(constraints.maxItems)
  }

  return propertySpec
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
  const validConstraints = constants.VALID_RANGE_CONSTRAINTS[type] || []
  const reduced = _reduceConstraints(astRange, validConstraints)
  const range = Object.assign(reduced, { type })

  if (label !== type) {
    range.format = label
  }

  if (range.type === 'LinkedClass') {
    checkClassReference(context, range.ref, astRange)
  }

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

function _getExcludeParentProperties (context, ast) {
  if (ast.length === 0) {
    croak(ast && ast[0], 'exludeParentProperties should be reference list')
  }

  return ast.map(astChild => {
    if (astChild.type !== 'reference') {
      croak(astChild, 'exludeParentProperties should be a reference')
    }
    const excluded = astChild.label.value
    checkClassReference(context, excluded, astChild)
    return excluded
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
  range: _getRange,
  excludeParentProperties: _getExcludeParentProperties
}
