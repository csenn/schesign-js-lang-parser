export default class InputSteam {
  constructor (text) {
    this.text = text
    this.pos = 0
    this.line = 1
    this.col = 0
    this.posMap = {}
    this._updatePositionMap()
  }
  _updatePositionMap () {
    Object.assign(this.posMap, {
      [this.pos]: { line: this.line, col: this.col }
    })
  }
  peek () {
    return this.text.charAt(this.pos)
  }
  next () {
    this.pos++
    const next = this.text.charAt(this.pos)
    if (next === '\n') {
      this.line++
      this.col = 0
    } else {
      this.col++
    }
    this._updatePositionMap()
    return next
  }
  eof () {
    return this.pos >= this.text.length
  }
  croak (message) {
    throw new Error(`Error at row: ${this.row} col: ${this.col}. ${message}`)
  }
}
