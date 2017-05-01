import fs from 'fs'
import path from 'path'
import { expect } from 'chai'
import {getAst} from '../src'
const { describe, it } = global

const readText = name => fs.readFileSync(path.resolve(__dirname, 'fixtures', name), 'utf-8')
// const basic = readText('basic.txt')

describe('parser should', () => {
  describe('handle errors and should fail', () => {
    it('when node Name is not Var', () => {
      const text = readText('error_node_name_type.txt')
      let error
      try { getAst(text) } catch (err) { error = err }
      expect(error.toString()).to.equal('Error: [line: 1 col: 0] Value: ";" is not "Class" or "Property"')
    })
    it('when node Name is not Class or Property', () => {
      const text = readText('error_node_name.txt')
      let error
      try { getAst(text) } catch (err) { error = err }
      expect(error.toString()).to.equal('Error: [line: 1 col: 0] Value: "class" is not "Class" or "Property"')
    })
    it('without opening bracket', () => {
      const text = readText('error_node_bracket_opening.txt')
      let error
      try { getAst(text) } catch (err) { error = err }
      expect(error.toString()).to.equal('Error: [line: 1 col: 12] [ should be a {')
    })
    it('without closing bracket', () => {
      const text = readText('error_node_bracket_closing.txt')
      let error
      try { getAst(text) } catch (err) { error = err }
      expect(error.toString()).to.equal('Error: [line: 2 col: 25] ; should be a }')
    })
    it('with bad node key', () => {
      const text = readText('error_node_row_key.txt')
      let error
      try { getAst(text) } catch (err) { error = err }
      expect(error.toString()).to.equal('Error: [line: 2 col: 3] "hello" must be one of description, subClassOf, properties')
    })
    it('with node key without colon', () => {
      const text = readText('error_node_row_colon.txt')
      let error
      try { getAst(text) } catch (err) { error = err }
      expect(error.toString()).to.equal('Error: [line: 2 col: 3] "hello" should be ":"')
    })
    it('with node row without semi colon 1', () => {
      const text = readText('error_node_row_semi_colon_1.txt')
      let error
      try { getAst(text) } catch (err) { error = err }
      expect(error.toString()).to.equal('Error: [line: 3 col: 1] Missing ";"')
    })
    it('with node row without semi colon 2', () => {
      const text = readText('error_node_row_semi_colon_2.txt')
      let error
      try { getAst(text) } catch (err) { error = err }
      expect(error.toString()).to.equal('Error: [line: 3 col: 3] Missing ";"')
    })
    it('with node with duplicate keys', () => {
      const text = readText('error_node_row_repeat.txt')
      let error
      try { getAst(text) } catch (err) { error = err }
      expect(error.toString()).to.equal('Error: [line: 4 col: 24] Should not declare "description" multiple times')
    })
    it('with node with double description', () => {
      const text = readText('error_node_key_description_1.txt')
      let error
      try { getAst(text) } catch (err) { error = err }
      expect(error.toString()).to.equal('Error: [line: 2 col: 3] Description should be a single text string in "double quotes"')
    })
    it('with node with double description', () => {
      const text = readText('error_node_key_description_2.txt')
      let error
      try { getAst(text) } catch (err) { error = err }
      expect(error.toString()).to.equal('Error: [line: 2 col: 3] Description should be a single text string in "double quotes"')
    })
    it('with node with null description', () => {
      const text = readText('error_node_key_description_3.txt')
      let error
      try { getAst(text) } catch (err) { error = err }
      expect(error.toString()).to.equal('Error: [line: 2 col: 3] Description should be a single text string in "double quotes"')
    })
    it('with node with null subClassOf', () => {
      const text = readText('error_node_key_subclassof_1.txt')
      let error
      try { getAst(text) } catch (err) { error = err }
      expect(error.toString()).to.equal('Error: [line: 2 col: 3] SubClassOf should be another class')
    })
    describe('for properties', () => {
      it('when property is string', () => {
        const text = readText('error_node_key_properties_1.txt')
        let error
        try { getAst(text) } catch (err) { error = err }
        expect(error.toString()).to.equal('Error: [line: 2 col: 17] "hello_1" must be a property reference')
      })
      it('when property has invalid contraint', () => {
        const text = readText('error_node_key_properties_2.txt')
        let error
        try { getAst(text) } catch (err) { error = err }
        expect(error.toString()).to.equal('Error: [line: 2 col: 23] "fish" must be one of: required, minItems, maxItems, array, index')
      })
      it('when property has equal sign but no constraint', () => {
        const text = readText('error_node_key_properties_3.txt')
        let error
        try { getAst(text) } catch (err) { error = err }
        expect(error.toString()).to.equal('Error: [line: 2 col: 31] = must be followed by a valid constraint')
      })
      it('when property has non text constraint', () => {
        const text = readText('error_node_key_properties_4.txt')
        let error
        try { getAst(text) } catch (err) { error = err }
        expect(error.toString()).to.equal('Error: [line: 2 col: 31] = must be followed by a valid constraint')
      })
    })
    describe('for range', () => {
      it('when type is string', () => {
        const text = readText('error_node_key_range_1.txt')
        let error
        try { getAst(text) } catch (err) { error = err }
        expect(error.toString()).to.equal('Error: [line: 2 col: 12] "hello_1" must be a property reference')
      })
      it('when type has invalid contraint', () => {
        const text = readText('error_node_key_range_2.txt')
        let error
        try { getAst(text) } catch (err) { error = err }
        expect(error.toString()).to.equal('Error: [line: 2 col: 18] "soie" must be one of: values, min, max, regex')
      })
      it('when type has equal sign but no constraint', () => {
        const text = readText('error_node_key_range_3.txt')
        let error
        try { getAst(text) } catch (err) { error = err }
        expect(error.toString()).to.equal('Error: [line: 2 col: 21] = must be followed by a valid constraint')
      })
    })
  })
  describe('should succeed', () => {
    it('to create an empty class', () => {
      const text = readText('node_label.txt')
      const ast = getAst(text)
      expect(ast).to.deep.equal({
        'classes': [
          {
            'label': {
              'position': {
                'end': 11,
                'start': 6
              },
              'type': 'VAR',
              'value': 'hello'
            }
          }
        ],
        'properties': []
      })
    })
    it('to create a description', () => {
      const text = readText('node_key_description.txt')
      const ast = getAst(text)
      expect(ast).to.deep.equal({
        'classes': [
          {
            'label': {
              'position': {
                'end': 11,
                'start': 6
              },
              'type': 'VAR',
              'value': 'hello'
            },
            'description': {
              'position': {
                'end': 38,
                'start': 31
              },
              'type': 'STRING',
              'value': 'hello_1'
            }
          }
        ],
        'properties': []
      })
    })
    it('to create a subclassof', () => {
      const text = readText('node_key_subclassof.txt')
      const ast = getAst(text)
      expect(ast).to.deep.equal({
        'classes': [
          {
            'label': {
              'position': {
                'end': 11,
                'start': 6
              },
              'type': 'VAR',
              'value': 'hello'
            },
            'subClassOf': {
              'position': {
                'end': 32,
                'start': 28
              },
              'type': 'VAR',
              'value': 'fish'
            }
          }
        ],
        'properties': []
      })
    })
    it('to create properties', () => {
      const text = readText('node_key_properties.txt')
      const ast = getAst(text)
      expect(ast).to.deep.equal({
        'classes': [
          {
            'label': {
              'type': 'VAR',
              'value': 'hello',
              'position': {
                'start': 6,
                'end': 11
              }
            },
            'properties': [
              {
                'ref': {
                  'type': 'VAR',
                  'value': 'a',
                  'position': {
                    'start': 32,
                    'end': 33
                  }
                },
                'constraints': []
              },
              {
                'ref': {
                  'type': 'VAR',
                  'value': 'b',
                  'position': {
                    'start': 39,
                    'end': 40
                  }
                },
                'constraints': [
                  {
                    'left': {
                      'type': 'VAR',
                      'value': 'required',
                      'position': {
                        'start': 41,
                        'end': 49
                      }
                    }
                  }
                ]
              },
              {
                'ref': {
                  'type': 'VAR',
                  'value': 'c',
                  'position': {
                    'start': 55,
                    'end': 56
                  }
                },
                'constraints': [
                  {
                    'left': {
                      'type': 'VAR',
                      'value': 'minItems',
                      'position': {
                        'start': 57,
                        'end': 65
                      }
                    },
                    'right': {
                      'type': 'STRING',
                      'value': '1',
                      'position': {
                        'start': 68,
                        'end': 69
                      }
                    }
                  }
                ]
              },
              {
                'ref': {
                  'type': 'VAR',
                  'value': 'd',
                  'position': {
                    'start': 75,
                    'end': 76
                  }
                },
                'constraints': [
                  {
                    'left': {
                      'type': 'VAR',
                      'value': 'required',
                      'position': {
                        'start': 77,
                        'end': 85
                      }
                    }
                  },
                  {
                    'left': {
                      'type': 'VAR',
                      'value': 'minItems',
                      'position': {
                        'start': 86,
                        'end': 94
                      }
                    },
                    'right': {
                      'type': 'STRING',
                      'value': '1',
                      'position': {
                        'start': 97,
                        'end': 98
                      }
                    }
                  },
                  {
                    'left': {
                      'type': 'VAR',
                      'value': 'maxItems',
                      'position': {
                        'start': 99,
                        'end': 107
                      }
                    },
                    'right': {
                      'type': 'STRING',
                      'value': '2',
                      'position': {
                        'start': 110,
                        'end': 111
                      }
                    }
                  }
                ]
              }
            ]
          }
        ],
        'properties': []
      })
    })
    it('to create a range', () => {
      const text = readText('node_key_range.txt')
      const ast = getAst(text)
      expect(ast).to.deep.equal({
        'classes': [],
        'properties': [
          {
            'label': {
              'type': 'VAR',
              'value': 'hello',
              'position': {
                'start': 9,
                'end': 14
              }
            },
            'range': {
              'ref': {
                'type': 'VAR',
                'value': 'Text',
                'position': {
                  'start': 26,
                  'end': 30
                }
              },
              'constraints': [
                {
                  'left': {
                    'type': 'VAR',
                    'value': 'regex',
                    'position': {
                      'start': 31,
                      'end': 36
                    }
                  },
                  'right': {
                    'type': 'STRING',
                    'value': 'hell',
                    'position': {
                      'start': 39,
                      'end': 43
                    }
                  }
                }
              ]
            }
          }
        ]
      })
    })
    it.skip('should balalal a', () => {
      const text = readText('basic.txt')
      const ast = getAst(text)
      expect(ast).to.deep.equal()
    })
  })
})
