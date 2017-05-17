import InputStream from './parser/InputStream'
import TokenStream from './parser/TokenStream'
import { parse } from './parser/parser'
import transformAst from './transformAst'

export function getTokenStream (txt) {
  const inputStream = new InputStream(txt)
  const tokenStream = new TokenStream(inputStream)
  tokenStream.read()
  return tokenStream
}

export function getAst (txt) {
  return parse(getTokenStream(txt))
}

export function getGraph (txt) {
  return transformAst(getAst(txt))
}
