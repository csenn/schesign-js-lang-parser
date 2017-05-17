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

export function transformClassBlock (context, astNode) {
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
  const node = _transformNode(context, astNode, constants.VALID_PROPERTY_ROW_TYPES)
  /* We move the properties into the range here. A bit wierd, but clean enough */
  if (node.range.type === 'NestedObject') {
    node.range.propertySpecs = node.properties
    delete node.properties
  }
  return Object.assign(node, {type: 'Property'})
}
