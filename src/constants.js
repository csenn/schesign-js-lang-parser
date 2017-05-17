export const VAR = 'var'
export const STRING = 'str'
export const NUM = 'num'
export const PUNC = 'punc'
export const BLOCK = 'block'
export const ASSIGN = 'assign'
export const REFERENCE = 'reference'

export const CLASS = 'Class'
export const PROPERTY = 'Property'

export const DESCRIPTION = 'description'
export const SUBCLASSOF = 'subClassOf'
export const PROPERTIES = 'properties'
export const RANGE = 'range'
export const EXCLUDE_PARENT_PROPERTIES = 'excludeParentProperties'

export const REF = 'ref'
export const CONSTRAINT_REQUIRED = 'required'
export const CONSTRAINT_PRIMARY_KEY = 'primaryKey'
export const CONSTRAINT_UNIQUE = 'unique'
export const CONSTRAINT_INDEX = 'index'
export const CONSTRAINT_ARRAY = 'array'
export const CONSTRAINT_MIN_ITEMS = 'minItems'
export const CONSTRAINT_MAX_ITEMS = 'maxItems'

export const CONSTRAINT_MIN_LENGTH = 'minLength'
export const CONSTRAINT_MAX_LENGTH = 'maxLength'
export const CONSTRAINT_VALUES = 'values'
export const CONSTRAINT_MIN = 'min'
export const CONSTRAINT_MAX = 'max'
export const CONSTRAINT_REGEX = 'regex'

export const VALID_BLOCK_TYPES = [
  CLASS,
  PROPERTY
]

export const VALID_ROW_TYPES = [
  DESCRIPTION,
  SUBCLASSOF,
  PROPERTIES,
  RANGE,
  EXCLUDE_PARENT_PROPERTIES
]

export const VALID_CLASS_ROW_TYPES = [
  DESCRIPTION,
  SUBCLASSOF,
  PROPERTIES,
  EXCLUDE_PARENT_PROPERTIES
]

export const VALID_PROPERTY_ROW_TYPES = [
  DESCRIPTION,
  RANGE,
  PROPERTIES
]

// const isTrue = val => !!val
// const isNumber = val => typeof val === 'number'
// const isText = val => typeof val === 'string'

/* Map contraints to their possible types */
export const VALID_CONTRAINT_TYPES = {
  [CONSTRAINT_REQUIRED]: [],
  [CONSTRAINT_ARRAY]: [],
  [CONSTRAINT_INDEX]: [],
  [CONSTRAINT_PRIMARY_KEY]: [],
  [CONSTRAINT_UNIQUE]: [],
  [CONSTRAINT_MIN_ITEMS]: [NUM],
  [CONSTRAINT_MAX_ITEMS]: [NUM],
  [CONSTRAINT_MIN_LENGTH]: [NUM],
  [CONSTRAINT_MAX_LENGTH]: [NUM],
  [CONSTRAINT_VALUES]: [NUM, STRING],
  [CONSTRAINT_MIN]: [NUM],
  [CONSTRAINT_MAX]: [NUM],
  [CONSTRAINT_REGEX]: [STRING],
  [REF]: [VAR]
}

/* These are property specific constraints */
export const VALID_PROPERTY_CONSTRAINTS = [
  CONSTRAINT_REQUIRED,
  CONSTRAINT_PRIMARY_KEY,
  CONSTRAINT_UNIQUE,
  CONSTRAINT_MIN_ITEMS,
  CONSTRAINT_MAX_ITEMS,
  CONSTRAINT_ARRAY,
  CONSTRAINT_INDEX
]

// Map ranges to parent types
export const RANGE_PARENT_MAPPING = {
  LinkedClass: 'LinkedClass',
  NestedObject: 'NestedObject',

  Boolean: 'Boolean',
  Enum: 'Enum',

  Text: 'Text',
  Url: 'Text',
  Email: 'Text',
  Hostname: 'Text',

  ShortDate: 'Date',
  DateTime: 'Date',
  Time: 'Date',

  Number: 'Number',
  Int: 'Number',
  Int8: 'Number',
  Int16: 'Number',
  Int32: 'Number',
  Int64: 'Number',
  Float32: 'Number',
  Float64: 'Number'
}

export const VALID_RANGE_CONSTRAINTS = {
  Text: [CONSTRAINT_REGEX, CONSTRAINT_MIN_LENGTH, CONSTRAINT_MAX_LENGTH],
  Number: [CONSTRAINT_MIN, CONSTRAINT_MAX],
  Enum: [CONSTRAINT_VALUES],
  LinkedClass: [REF]
}
