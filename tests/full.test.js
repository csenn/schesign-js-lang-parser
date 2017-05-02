import fs from 'fs'
import path from 'path'
import { expect } from 'chai'
import { getGraph } from '../src'
import temp from './fixtures/temp.json'
const { describe, it } = global

const readText = name => fs.readFileSync(path.resolve(__dirname, 'fixtures', 'full', name), 'utf-8')
// const basic = readText('basic.txt')

describe('Full graph. Should parse', () => {
  it('property_variations', () => {
    const text = readText('property_variations.txt')
    const graph = getGraph(text)
    expect(graph).to.deep.equal(temp.graph)
  })
})
