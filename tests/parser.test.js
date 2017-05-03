  import fs from 'fs'
  import path from 'path'
  import { expect } from 'chai'
  import {getAst} from '../src'
  const { describe, it } = global

  const readText = name => fs.readFileSync(path.resolve(__dirname, 'fixtures', 'parser', name), 'utf-8')
// const basic = readText('basic.txt')

  describe('parser should', () => {
    describe('handle errors and should fail', () => {
      describe('reading block', () => {
        it('when node name is not Class or Property', () => {
          const text = readText('error_node_name.txt')
          let error
          try { getAst(text) } catch (err) { error = err }
          expect(error.message).to.equal('Line 1, Col 0 Value: "class" is not "Class" or "Property"')
        })
        it('when node name is not Var', () => {
          const text = readText('error_node_name_type.txt')
          let error
          try { getAst(text) } catch (err) { error = err }
          expect(error.message).to.equal('Line 1, Col 0 Value: ";" is invalid')
        })
        it('without opening bracket', () => {
          const text = readText('error_node_bracket_opening.txt')
          let error
          try { getAst(text) } catch (err) { error = err }
          expect(error.message).to.equal('Line 1, Col 12 [ should be a "{"')
        })
        it('without closing bracket', () => {
          const text = readText('error_node_bracket_closing.txt')
          let error
          try { getAst(text) } catch (err) { error = err }
          expect(error.message).to.equal('Line 4, Col 1 "Class" should be a "}"')
        })
      })
      describe('reading row', () => {
        it('without colon', () => {
          const text = readText('error_node_row_colon.txt')
          let error
          try { getAst(text) } catch (err) { error = err }
          expect(error.message).to.equal('Line 2, Col 15 "hello" should be ":"')
        })
        it('without semi colon 1', () => {
          const text = readText('error_node_row_semi_colon_1.txt')
          let error
          try { getAst(text) } catch (err) { error = err }
          expect(error.message).to.equal('Line 2, Col 18 "}" should be a comma or semi-colon')
        })
        it('without semi colon 2', () => {
          const text = readText('error_node_row_semi_colon_2.txt')
          let error
          try { getAst(text) } catch (err) { error = err }
          expect(error.message).to.equal('Line 2, Col 18 "properties" should be a comma or semi-colon')
        })
        it('with bad node key', () => {
          const text = readText('error_node_row_key.txt')
          let error
          try { getAst(text) } catch (err) { error = err }
          expect(error.message).to.equal('Line 2, Col 3 "hello" must be one of: description, subClassOf, properties, range')
        })
        it('with no value', () => {
          const text = readText('error_node_row_missing_value.txt')
          let error
          try { getAst(text) } catch (err) { error = err }
          expect(error.message).to.equal('Line 2, Col 14 A value must be provided')
        })
        it('with double string', () => {
          const text = readText('error_node_row_double_string.txt')
          let error
          try { getAst(text) } catch (err) { error = err }
          expect(error.message).to.equal('Line 2, Col 23 Can not have multiple strings')
        })
      })
      describe('reading row constraint', () => {
        it('with missing constraint label', () => {
          const text = readText('error_node_row_constraint_no_label.txt')
          let error
          try { getAst(text) } catch (err) { error = err }
          const str = 'Line 2, Col 23 Value: "=" must be one of'
          expect(error.message.indexOf(str) > -1).to.equal(true)
        })
        it('with missing = sign', () => {
          const text = readText('error_node_row_constraint_missing_equals.txt')
          let error
          try { getAst(text) } catch (err) { error = err }
          const str = 'Line 2, Col 32 Value: "0" must be one of'
          expect(error.message.indexOf(str) > -1).to.equal(true)
        })
        it('with double labels', () => {
          const text = readText('error_node_row_constraint_double_label.txt')
          let error
          try { getAst(text) } catch (err) { error = err }
          const str = 'Line 2, Col 23 Value: "hello_2" must be one of'
          expect(error.message.indexOf(str) > -1).to.equal(true)
        })
        it('with floating equals', () => {
          const text = readText('error_node_row_constraint_empty_equals.txt')
          let error
          try { getAst(text) } catch (err) { error = err }
          expect(error.message).to.equal('Line 2, Col 32 Value: ";" should be a string or number')
        })
      })
      it.skip('with node with duplicate keys', () => {
        const text = readText('error_node_row_repeat.txt')
        let error
        try { getAst(text) } catch (err) { error = err }
        expect(error.message).to.equal('Line 4, Col 24 Should not declare "description" multiple times')
      })
    })
    describe('build ast', () => {
      it('create an empty class', () => {
        const text = readText('node_label.txt')
        const ast = getAst(text)
        expect(ast).to.deep.equal([
          {
            blockType: 'Class',
            type: 'block',
            label: {
              type: 'var',
              value: 'hello',
              start: { col: 6, line: 1, pos: 6 },
              end: { col: 11, line: 1, pos: 11 }
            },
            body: []
          }
        ])
      })
      it('create a description', () => {
        const text = readText('node_key_description.txt')
        const ast = getAst(text)
        expect(ast).to.deep.equal([
          {
            blockType: 'Class',
            type: 'block',
            label: {
              type: 'var',
              value: 'hello',
              start: { col: 6, line: 1, pos: 6 },
              end: { col: 11, line: 1, pos: 11 }
            },
            body: [{
              type: 'assign',
              operator: ':',
              left: {
                type: 'var',
                value: 'description',
                start: {col: 3, line: 2, pos: 16},
                end: {col: 14, line: 2, pos: 27}
              },
              right: [{
                type: 'str',
                value: 'hello_1',
                start: {col: 18, line: 2, pos: 31},
                end: {col: 25, line: 2, pos: 38}
              }]
            }]
          }
        ])
      })
      it('create a subclassof', () => {
        const text = readText('node_key_subclassof.txt')
        const ast = getAst(text)
        expect(ast).to.deep.equal([
          {
            blockType: 'Class',
            type: 'block',
            label: {
              type: 'var',
              value: 'hello',
              start: { col: 6, line: 1, pos: 6 },
              end: { col: 11, line: 1, pos: 11 }
            },
            body: [{
              type: 'assign',
              operator: ':',
              left: {
                type: 'var',
                value: 'subClassOf',
                start: {col: 3, line: 2, pos: 16},
                end: {col: 13, line: 2, pos: 26}
              },
              right: [{
                type: 'reference',
                label: {
                  type: 'var',
                  value: 'fish',
                  start: {col: 15, line: 2, pos: 28},
                  end: {col: 19, line: 2, pos: 32}
                },
                constraints: []
              }]
            }]
          }
        ])
      })
      it('create properties', () => {
        const text = readText('node_key_properties.txt')
        const ast = getAst(text)
        expect(ast).to.deep.equal([
          {
            blockType: 'Class',
            type: 'block',
            label: {
              type: 'var',
              value: 'hello',
              start: { col: 6, line: 1, pos: 6 },
              end: { col: 11, line: 1, pos: 11 }
            },
            body: [{
              type: 'assign',
              operator: ':',
              left: {
                type: 'var',
                value: 'properties',
                start: {col: 3, line: 2, pos: 16},
                end: {col: 13, line: 2, pos: 26}
              },
              right: [
                {
                  type: 'reference',
                  label: {
                    type: 'var',
                    value: 'a',
                    start: {col: 5, line: 3, pos: 32},
                    end: {col: 6, line: 3, pos: 33}
                  },
                  constraints: []
                },
                {
                  type: 'reference',
                  label: {
                    type: 'var',
                    value: 'b',
                    start: {col: 5, line: 4, pos: 39},
                    end: {col: 6, line: 4, pos: 40}
                  },
                  constraints: [
                    {
                      type: 'assign',
                      operator: '=',
                      left: {
                        type: 'var',
                        value: 'required',
                        start: {col: 7, line: 4, pos: 41},
                        end: {col: 15, line: 4, pos: 49}
                      },
                      right: []
                    }
                  ]
                },
                {
                  type: 'reference',
                  label: {
                    type: 'var',
                    value: 'c',
                    start: {col: 5, line: 5, pos: 55},
                    end: {col: 6, line: 5, pos: 56}
                  },
                  constraints: [
                    {
                      type: 'assign',
                      operator: '=',
                      left: {
                        type: 'var',
                        value: 'required',
                        start: {col: 7, line: 5, pos: 57},
                        end: {col: 15, line: 5, pos: 65}
                      },
                      right: []
                    },
                    {
                      type: 'assign',
                      operator: '=',
                      left: {
                        type: 'var',
                        value: 'minItems',
                        start: {col: 16, line: 5, pos: 66},
                        end: {col: 24, line: 5, pos: 74}
                      },
                      right: [{
                        type: 'num',
                        value: 1,
                        start: {col: 25, line: 5, pos: 75},
                        end: {col: 26, line: 5, pos: 76}
                      }]
                    },
                    {
                      type: 'assign',
                      operator: '=',
                      left: {
                        type: 'var',
                        value: 'maxItems',
                        start: {col: 27, line: 5, pos: 77},
                        end: {col: 35, line: 5, pos: 85}
                      },
                      right: [{
                        type: 'str',
                        value: 'null',
                        start: {col: 38, line: 5, pos: 88},
                        end: {col: 42, line: 5, pos: 92}
                      }]
                    }
                  ]
                }
              ]
            }]
          }
        ])
      })
      it('create a range', () => {
        const text = readText('node_key_range.txt')
        const ast = getAst(text)
        expect(ast).to.deep.equal([
          {
            blockType: 'Property',
            type: 'block',
            label: {
              type: 'var',
              value: 'hello',
              start: { col: 9, line: 1, pos: 9 },
              end: { col: 14, line: 1, pos: 14 }
            },
            body: [{
              type: 'assign',
              operator: ':',
              left: {
                type: 'var',
                value: 'range',
                start: {col: 3, line: 2, pos: 19},
                end: {col: 8, line: 2, pos: 24}
              },
              right: [
                {
                  type: 'reference',
                  label: {
                    type: 'var',
                    value: 'Enum',
                    start: {col: 10, line: 2, pos: 26},
                    end: {col: 14, line: 2, pos: 30}
                  },
                  constraints: [
                    {
                      type: 'assign',
                      operator: '=',
                      left: {
                        type: 'var',
                        value: 'values',
                        start: {col: 15, line: 2, pos: 31},
                        end: {col: 21, line: 2, pos: 37}
                      },
                      right: [
                        {
                          type: 'num',
                          value: 1,
                          start: {col: 23, line: 2, pos: 39},
                          end: {col: 24, line: 2, pos: 40}
                        },
                        {
                          type: 'str',
                          value: 'hello1',
                          start: {col: 28, line: 2, pos: 44},
                          end: {col: 34, line: 2, pos: 50}
                        }
                      ]
                    }
                  ]
                }
              ]
            }]
          }
        ])
      })
    })
  })
