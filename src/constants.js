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

export const CONSTRAINT_REQUIRED = 'required'
export const CONSTRAINT_MIN_ITEMS = 'minItems'
export const CONSTRAINT_MAX_ITEMS = 'maxItems'
export const CONSTRAINT_ARRAY = 'array'
export const CONSTRAINT_INDEX = 'index'
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
  RANGE
]

export const VALID_CONTRAINT_TYPES = [
  CONSTRAINT_REQUIRED,
  CONSTRAINT_MIN_ITEMS,
  CONSTRAINT_MAX_ITEMS,
  CONSTRAINT_ARRAY,
  CONSTRAINT_INDEX,
  CONSTRAINT_VALUES,
  CONSTRAINT_MIN,
  CONSTRAINT_MAX,
  CONSTRAINT_REGEX
]

export const VALID_PROPERTY_CONSTRAINTS = [
  CONSTRAINT_REQUIRED,
  CONSTRAINT_MIN_ITEMS,
  CONSTRAINT_MAX_ITEMS,
  CONSTRAINT_ARRAY,
  CONSTRAINT_INDEX
]
