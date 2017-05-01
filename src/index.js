import InputStream from './InputStream'
import TokenStream from './TokenStream'
import { parse } from './parser'

export default function buildGraph (txt) {
  const inputStream = new InputStream(txt)
  const tokenStream = new TokenStream(inputStream)
  tokenStream.read()

  console.log(tokenStream.tokens)

  return parse(tokenStream)
}
