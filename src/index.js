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

export default function buildGraph (txt) {
  const ast = getAst(txt)
  return convertAndValidate(ast)
}
