import fs from 'fs'
import path from 'path'
import { expect } from 'chai'
import { getGraph } from '../src'
const { describe, it } = global

const readText = name => fs.readFileSync(path.resolve(__dirname, 'fixtures', 'convertAndValidate', name), 'utf-8')
// const basic = readText('basic.txt')

describe('convertAndValidate should', () => {
  describe('handle errors and should fail', () => {
    describe('blocks', () => {
      it('with invalid row', () => {
        const text = readText('error_invalid_class_row.txt')
        let error
        try { getGraph(text) } catch (err) { error = err }
        expect(error.toString()).to.equal('Error: [line: 2 col: 3] "range" is invalid in this block')
      })
      it('with duplicate description', () => {
        const text = readText('error_duplicate_properties.txt')
        let error
        try { getGraph(text) } catch (err) { error = err }
        expect(error.toString()).to.equal('Error: [line: 3 col: 3] "description" is declared multiple times in this block')
      })
    })
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
        const str = 'Error: [line: 2 col: 17] Value: "b" must be one'
        expect(error.toString().indexOf(str) > -1).to.equal(true)
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
    describe('range', () => {
      it('with string', () => {
        const text = readText('error_node_key_range_1.txt')
        let error
        try { getGraph(text) } catch (err) { error = err }
        expect(error.toString()).to.equal('Error: [line: 2 col: 12] Range should be a single reference')
      })
      it('with multiple types', () => {
        const text = readText('error_node_key_range_2.txt')
        let error
        try { getGraph(text) } catch (err) { error = err }
        expect(error.toString()).to.equal('Error: [line: 2 col: 10] Range should be a single reference')
      })
      it('bad range type', () => {
        const text = readText('error_node_key_range_3.txt')
        let error
        try { getGraph(text) } catch (err) { error = err }
        const str = 'Error: [line: 2 col: 10] Invalid range type "text." Must be'
        expect(error.toString().indexOf(str) > -1).to.equal(true)
      })
      it('with wrong constraint type', () => {
        const text = readText('error_node_key_range_4.txt')
        let error
        try { getGraph(text) } catch (err) { error = err }
        expect(error.toString()).to.equal('Error: [line: 2 col: 10] "min" is invalid. Can only be one of regex, minLength, maxLength')
      })
    })
  })
})
