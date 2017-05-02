import fs from 'fs'
import path from 'path'
import { expect } from 'chai'
import { getGraph } from '../src'
const { describe, it } = global

const readText = name => fs.readFileSync(path.resolve(__dirname, 'fixtures', 'convertAndValidate', name), 'utf-8')
// const basic = readText('basic.txt')

describe('convertAndValidate should', () => {
  describe('handle errors and should fail', () => {
    describe('description', () => {
      it('with double description', () => {
        const text = readText('error_node_key_description_1.txt')
        let error
        try { getGraph(text) } catch (err) { error = err }
        expect(error.toString()).to.equal('Error: [line: 2 col: 18] "also_hello" should be a comma or semi-colon')
      })
      it('with non string', () => {
        const text = readText('error_node_key_description_2.txt')
        let error
        try { getGraph(text) } catch (err) { error = err }
        expect(error.toString()).to.equal('Error: [line: 2 col: 16] Description should be a single string')
      })
    })
    describe('subClassOf', () => {
      it('with double subclassof', () => {
        const text = readText('error_node_key_subclassof_1.txt')
        let error
        try { getGraph(text) } catch (err) { error = err }
        expect(error.toString()).to.equal('Error: [line: 2 col: 17] Value: "b" must be one of required, minItems, maxItems, array, index, values, min, max, regex')
      })
      it('with non reference', () => {
        const text = readText('error_node_key_subclassof_2.txt')
        let error
        try { getGraph(text) } catch (err) { error = err }
        expect(error.toString()).to.equal('Error: [line: 2 col: 17] SubClassOf should be a single reference')
      })
      it('with comma seperated references', () => {
        const text = readText('error_node_key_subclassof_3.txt')
        let error
        try { getGraph(text) } catch (err) { error = err }
        expect(error.toString()).to.equal('Error: [line: 2 col: 15] SubClassOf should be a single reference')
      })
    })
    describe('properties', () => {
      it('when one is a string', () => {
        const text = readText('error_node_key_properties_1.txt')
        let error
        try { getGraph(text) } catch (err) { error = err }
        expect(error.toString()).to.equal('Error: [line: 2 col: 17] Must be a valid property reference')
      })
      it('when any are a string', () => {
        const text = readText('error_node_key_properties_2.txt')
        let error
        try { getGraph(text) } catch (err) { error = err }
        expect(error.toString()).to.equal('Error: [line: 2 col: 17] Must be a valid property reference')
      })
      it('when constraint is invalid', () => {
        const text = readText('error_node_key_properties_3.txt')
        let error
        try { getGraph(text) } catch (err) { error = err }
        expect(error.toString()).to.equal('Error: [line: 2 col: 15] "values" is invalid. Can only be one of required, minItems, maxItems, array, index')
      })
      it('when constraint is declared twice', () => {
        const text = readText('error_node_key_properties_4.txt')
        let error
        try { getGraph(text) } catch (err) { error = err }
        expect(error.toString()).to.equal('Error: [line: 2 col: 15] minItems is a duplicated constraint')
      })
      it('required and minItems should not be used together', () => {
        const text = readText('error_node_key_properties_5.txt')
        let error
        try { getGraph(text) } catch (err) { error = err }
        expect(error.toString()).to.equal('Error: [line: 2 col: 15] "required" and "minItems" can not be used together')
      })
      it('array and maxItems should not be used together', () => {
        const text = readText('error_node_key_properties_6.txt')
        let error
        try { getGraph(text) } catch (err) { error = err }
        expect(error.toString()).to.equal('Error: [line: 2 col: 15] "array" and "maxItems" can not be used together')
      })
    })

    it.skip('bla bla', () => {
      const text = readText('../property_variations.txt')
      let error

      const graph = getGraph(text)

      console.log(JSON.stringify(graph, null, 2))

      try { getGraph(text) } catch (err) { error = err }
      expect(error.toString()).to.equal('Error: [line: 1 col: 0] Value: ";" is not "Class" or "Property"')
    })
  })
})
