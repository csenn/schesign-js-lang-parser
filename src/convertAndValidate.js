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

function getPropertySpecs (context, astNode) {
  const { properties } = astNode
  if (!properties) {
    return
  }

  return properties.map(node => {
    const ref = getValue(node, 'ref', true)
    // if (!context.properties[ref]) {
    //   addError(context, node.ref, `Property "${ref}" in class "${astNode}" has not been defined`)
    // }
    return { ref }
  })

  // console.log('asds')

  // const properties = getValue(astNode, 'properties', true)
}

function getPropertyNode (context, astNode) {
  const node = Object.assign({type: 'Property'}, getCommonData(astNode))
  return node
}

function getClassNode (context, astNode) {
  const node = Object.assign({type: 'Class'}, getCommonData(astNode))
  node.propertySpecs = getPropertySpecs(context, astNode)
  return node
}

export default function (ast) {
  const graph = []
  // const classes = {}
  // const properties = {}

  const context = {
    classes: {},
    properties: {},
    errors: []
  }

  /* Create lookup so we can ensure references exist */
  ast.forEach(astNode => {
    const type = astNode._type
    const label = getValue(astNode, 'label', true)
    if (type === constants.CLASS) {
      context.classes[label] = astNode
    } else if (type === constants.PROPERTY) {
      context.properties[label] = astNode
    } else {
      throw new Error(`Type must be a class or property type: ${astNode._type}`)
    }
  })

  ast.forEach(astNode => {
    const func = astNode._type === constants.CLASS ? getClassNode : getPropertyNode
    graph.push(func(context, astNode))
  })

  if (context.errors.length) {
    const error = context.errors[0]
    const {line, col} = error.start
    const message = `[line: ${line} col: ${col}] ${error.message}`
    throw new Error(message)
  }

  return graph
}
