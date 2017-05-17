import fs from 'fs'
import path from 'path'
import { expect } from 'chai'
import { getGraph } from '../src'
import basic from '../../schesign-graph-examples/graphs/import/basic'
import recursion from '../../schesign-graph-examples/graphs/import/recursion'
import propertyVariations from '../../schesign-graph-examples/graphs/import/property_variations'
import linkedNodes2 from '../../schesign-graph-examples/graphs/import/linked_nodes_2'
import inhertianceChain2 from '../../schesign-graph-examples/graphs/import/inheritance_chain_2'

const { describe, it } = global

const readText = name => fs.readFileSync(path.resolve(__dirname, 'fixtures', 'full', name), 'utf-8')
// const basic = readText('basic.txt')

describe('Full graph. Should parse', () => {
  it('basic', () => {
    const graph = getGraph(readText('basic.txt'))
    expect(graph).to.deep.equal(basic.graph)
  })
  it('propertyVariations', () => {
    const graph = getGraph(readText('property_variations.txt'))
    expect(graph).to.deep.equal(propertyVariations.graph)
  })
  it('recursion', () => {
    const graph = getGraph(readText('recursion.txt'))
    expect(graph).to.deep.equal(recursion.graph)
  })
  it('linkedNodes', () => {
    const graph = getGraph(readText('linked_nodes_2.txt'))
    expect(graph).to.deep.equal(linkedNodes2.graph)
  })
  it('inhertianceChain', () => {
    const graph = getGraph(readText('inheritance_chain_2.txt'))
    expect(graph).to.deep.equal(inhertianceChain2.graph)
  })
})
