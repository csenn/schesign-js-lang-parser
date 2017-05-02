import fs from 'fs'
import path from 'path'
import { expect } from 'chai'
import { getGraph } from '../src'
const { describe, it } = global

const readText = name => fs.readFileSync(path.resolve(__dirname, 'fixtures', 'convertAndValidate', name), 'utf-8')
// const basic = readText('basic.txt')

describe.skip('convertAndValidate should', () => {
  describe('handle errors and should fail', () => {
    it.skip('when a class references a propety that does not exist', () => {
      const text = readText('error_property_does_not_exist.txt')
      let error
      try { getGraph(text) } catch (err) { error = err }
      expect(error.toString()).to.equal('Error: [line: 1 col: 0] Value: ";" is not "Class" or "Property"')
    })
    it('bla bla', () => {
      const text = readText('../property_variations.txt')
      let error

      const graph = getGraph(text)

      console.log(JSON.stringify(graph, null, 2))

      try { getGraph(text) } catch (err) { error = err }
      expect(error.toString()).to.equal('Error: [line: 1 col: 0] Value: ";" is not "Class" or "Property"')
    })
  })
})
