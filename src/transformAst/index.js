import { transformClassBlock, transformPropertyBlock } from './transformBlock'
import * as constants from '../constants'
import { croak } from './utils'

export default function (ast) {
  const context = {
    classes: {},
    properties: {}
  }

  /* Fill the context */
  ast.forEach(astNode => {
    const cache = astNode.blockType === constants.CLASS
      ? context.classes
      : context.properties

    const label = astNode.label.value.toLowerCase()
    if (cache[label]) {
      croak(astNode, `${astNode.blockType} "${astNode.label.value}" has already been declared`)
    }
    cache[label] = astNode
  })

  return ast.map(astNode => {
    const func = astNode.blockType === constants.CLASS
      ? transformClassBlock
      : transformPropertyBlock
    return func(context, astNode)
  })
}
