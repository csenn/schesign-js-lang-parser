import { transformBodyMap } from './transformBlockBody'
import { croak } from './utils'
import * as constants from '../constants'

function _transformNode (context, astNode, validRowKeys) {
  const node = { label: astNode.label.value }
  astNode.body.forEach(row => {
    const rowKey = row.left.value
    if (!validRowKeys.includes(rowKey)) {
      croak(row.left, `"${rowKey}" is invalid in this block`)
    }
    if (rowKey in node) {
      croak(row.left, `"${rowKey}" is declared multiple times in this block`)
    }
    node[rowKey] = transformBodyMap[rowKey](context, row.right)
  })

  return node
}

/* See if this is an import node */
function _getImport (type, astNode) {
  const { value } = astNode.label
  /* TODO: check for valid class or property uid type */
  if (astNode.body === null && value.indexOf('/') > -1) {
    return {
      type: type,
      uid: value
    }
  }
  return null
}

export function transformClassBlock (context, astNode) {
  const importNode = _getImport('Class', astNode)
  if (importNode) return importNode

  const node = _transformNode(context, astNode, constants.VALID_CLASS_ROW_TYPES)
  if (node.properties) {
    node.propertySpecs = node.properties
    delete node.properties
  } else {
    /* Provide a default empty array to satisfy specification */
    node.propertySpecs = []
  }
  return Object.assign(node, {type: 'Class'})
}

export function transformPropertyBlock (context, astNode) {
  const importNode = _getImport('Property', astNode)
  if (importNode) return importNode

  const node = _transformNode(context, astNode, constants.VALID_PROPERTY_ROW_TYPES)
  /* We move the properties into the range here. A bit wierd, but clean enough */
  if (node.range.type === 'NestedObject') {
    node.range.propertySpecs = node.properties
    delete node.properties
  }
  return Object.assign(node, {type: 'Property'})
}
