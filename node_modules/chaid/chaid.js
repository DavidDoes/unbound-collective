function normalize (target) {
  if (target === null || typeof target === 'undefined')
    throw new Error('chaid will not compare null or undefined ids')
  if (typeof target === 'string')
    return target
  if (typeof target.toHexString === 'function')
    return target.toHexString()
  if (typeof target.id != 'undefined')
    return target.id.toString()
  if (typeof target._id != 'undefined')
    return target._id.toString()
  throw new Error('chaid could not get an id from ' + target)
}

module.exports = function (chai, utils) {

  chai.Assertion.addMethod('id', function (target) {
    var expected = normalize(target),
        actual = normalize(this._obj)

    this.assert(
      actual == expected,
      'expected #{act} to have id #{exp}',
      'expected #{act} not to have id #{exp}',
      expected,
      actual
    )
  })

  chai.Assertion.addProperty('unordered', function() {
    utils.flag(this, 'unordered', true)
  })

  chai.Assertion.addMethod('ids', function (target) {
    var expected = target.map(normalize),
        actual = this._obj.map(normalize),
        assertion = new chai.Assertion(actual)
    utils.transferFlags(this, assertion, false)

    if (utils.flag(this, 'contains')) {
      assertion.to.include.members(expected)
    } else if (utils.flag(this, 'unordered')) {
      assertion.to.have.members(expected)
    } else {
      assertion.to.eql(expected)
    }
  })
}
