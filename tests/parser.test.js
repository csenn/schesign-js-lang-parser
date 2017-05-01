import fs from 'fs'
import path from 'path'
import { expect } from 'chai'
import buildGraph from '../src'
const { describe, it } = global

const readText = name => fs.readFileSync(path.resolve(__dirname, 'fixtures', name), 'utf-8')
const basic = readText('basic.txt')

describe('parser should', () => {
  describe('handle errors and', () => {
    it('should fail when node Name is not Class or Property', () => {
      const text = readText('error_node_name.txt')
      let error
      try {
        buildGraph(text)
      } catch (err) {
        error = err
      }
      console.log(error)
      expect(error.toString()).to.equal('Error: line: 1 col: 0. Value: class is not "Class" or "Property"')
    })
  })
  describe('parse success', () => {
    it('should convert simple to a json schema', () => {
      const a = buildGraph(basic)
      expect(a).to.deep.equal({})
    })
  })
})
