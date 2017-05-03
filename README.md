# Schesign Text Based Language Parser

Class Block Api

Many prefer using a text based format for data modelling.
This Schesign DSL (Domain Specific Language) is for writing and reading a schesign data design.
Instead of writing and reading a JSON config file directly, this DSL is meant to be
easier to read, write, and learn.

Note: When interacting with the schesign API, a pure json format is used. This library converts
the Schesign DSL into that json.

Class Block Examples

### Block ###
# "Class" is the block type
# "MyClass" is the block label
# valid block types: Class, Property

Class MyClass {}


### Class Block ###
# valid block keys: description, subClassOf, properties

Class Class1 {

  # type: string
  description: "My detailed class description";

  # type: reference
  subClassOf: Class2;

  # type: reference list
  # constraints:
    # required: boolean (optional)
    # array: boolean (optional)
    # primaryKey: boolean (optional)
    # minItems: number (optional)
    # maxItems: number (optional)
    # Note: required is shorthand for minItems=1. These can't be used together
    # Note: array is shorthand for maxItems="null". These can't be used together
  properties:
    a,
    b required array primary index,
    c minItems=0 maxItems=10;
}

Class Class2 {
  properties: d, e;
}

Property Block Examples

### Property Block ###
# valid block keys: description, range, properties
# note: properties is only valid with range: NestedObject

Property propA {
  # type: string
  description: "My detailed class description";

  # valid types:
    # Boolean, Text, Url, Email
    # Number, Int, Int8, Int16, Int32, Int64, Float32, Float64
    # DateTime, ShortDate, Time
    # Enum, LinkedClass, NestedObject
  # note: each type has unique contraints
  range: Text;
}

### Boolean ###
Property a { range: Boolean; }

### Text ###
# range constraints:
  # regex: string (optional)
  # minLength: number (optional)
  # maxLength: number (optional)
Property a { range: Text regex="[a-z]"; }
Property a1 { range: Text minLength=8 maxLength=12; }
Property a2 { range: Url; }
Property a3 { range: Email; }

### Number ###
# range constraints:
  # min: number (optional)
  # max: number (optional)
Property b { range: Number min=10 max=100; }
Property b1 { range: Int; }
Property b1 { range: Int8; }
Property b1 { range: Int16; }
Property b1 { range: Int32; }
Property b1 { range: Int64; }
Property b1 { range: Float32; }
Property b1 { range: Float64; }

### Date ###
Property c { range: DateTime; }
Property c1 { range: ShortDate; }
Property c2 { range: Time; }

### Enum ###
# range constraints:
  # values: array (required)
Property d { range: Enum values=["one", "two", 1, 2.5]; }

### NestedObject ###
# Note: properties row follows same rules as Class.properties above
Property e {
  range: NestedObject;
  properties: a, b;
}

### LinkedClass ###
# range constraints:
  # ref: reference (required) - Can reference internal or external classes
Property e { range: LinkedClass ref=Class2; }
Property e1 { range: LinkedClass ref=u/user_a/design_a/1.0.0/class/class_a; }

[
  {
    type: "block",
    label: {
      type: "var",
      value: "MyClass"
    },
    body: [
      {
        type: "assign",
        operator: ":",
        left: {
          type: "var",
          value: "description"
        },
        right: {
          type: "str",
          value: "some desc"
        }
      },
      {
        type: "assign",
        operator: ":",
        left: {
          type: "var",
          value: "properties"
        },
        right: [
          {
            type: "reference",
            label: {
              type: "var",
              value: "some_prop"
            },
            constraints: [
              {
                type: "var",
                value: "required"
              },
              {
                type: "assign",
                operator: "=",
                left: {
                  type: "str",
                  value: "minItems"
                },
                right: {
                  type: "num",
                  value: 3
                }
              }
            ]
          }
        ]
      }
    ]
  }
]

[
  type: "str",
  value: "Class",

]