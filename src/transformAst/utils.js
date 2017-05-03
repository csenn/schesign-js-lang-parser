import PositionError from '../PositionError'

/*
  Should always have token, lets be safe though
  In several cases the location information exists
  in the label, lets check both spots
*/
export function croak (nodeOrToken, message) {
  const token = nodeOrToken.label || nodeOrToken
  const { line, col } = token.start
  const position = { start: token.start, end: token.end }
  throw new PositionError(`Line ${line}, Col ${col} ${message}`, position)
}

function _checkReference (type, cache, ref, token) {
  if (ref.indexOf('u/') > -1 || ref.indexOf('o/') > -1) {
    return
  }
  if (!cache[ref]) {
    croak(token, `${type} "${ref}" has not been defined`)
  }
}

export function checkClassReference (context, ref, token) {
  _checkReference('Class', context.classes, ref, token)
}

export function checkPropertyReference (context, ref, token) {
  _checkReference('Property', context.properties, ref, token)
}
