import InputStream from './parser/InputStream'
import TokenStream from './parser/TokenStream'
import { parse } from './parser/parser'
import transformAst from './transformAst'
// import { validateGraph } from '../../schesign-js-graph-utils/dist/validate'

export function getTokenStream (txt) {
  const inputStream = new InputStream(txt)
  const tokenStream = new TokenStream(inputStream)
  tokenStream.read()
  return tokenStream
}

export function getAst (txt) {
  const tokenStream = getTokenStream(txt)
  const ast = parse(tokenStream)
  return ast
}

export function getGraph (txt) {
  const ast = getAst(txt)
  const graph = transformAst(ast)

  // const err = validateGraph(graph)
  // if (err) {
  //   throw new Error(err)
  // }

  return graph
}
