/* Easily expose position of error */
export default function PositionError (message, position) {
  this.name = 'PositionError'
  this.message = message || 'Default Message'
  this.position = position
  this.stack = (new Error()).stack
}
PositionError.prototype = Object.create(Error.prototype)
PositionError.prototype.constructor = PositionError
