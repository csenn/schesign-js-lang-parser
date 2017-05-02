import InputStream from './InputStream'
import TokenStream from './TokenStream'
import { parse } from './parser'
import convertAndValidate from './convertAndValidate'

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
  const graph = convertAndValidate(ast)
  // console.log(graph)
  return graph
}
