/**
 * This is a data structure to manipulate with ids
 * of Accordion sections.
 *
 * Could have used ES6 class to extend ES6 Set,
 * but it turned out that Babel doesn't currently
 * support extending of builtin classes,
 * so I resorted to using a wrap over Set instead.
 */

/**
 * Wrap around ES6 Set
 *  proxies only 3 methods required for this project:
 *    - has, size and [Symbol.iterator]
 * and adds a few new methods:
 *    - toArray, first, AND, XOR, equal
 * Specific features:
 *  1. entries are always sorted at construction time
 *    - good for comparing sets of ids: order doesn't matter
 *      for AccordionSections
 *  2. new methods returning xSet are non-mutating
 *      as they always return a new instance
 */
export function xSet(from) {
  if (!(this instanceof xSet)) {
    return new xSet(from)
  }

  // always sort values at construction time
  this.s = new Set(argToArray(from).sort())
}

xSet.prototype.has = function(...arg) {
  return this.s.has(...arg)
}

xSet.prototype.size = function() {
  return this.s.size
}

xSet.prototype[Symbol.iterator] = function() {
  return this.s.values()
}

/**
 * Extract underlying values as an Array
 *  ( contrary to Set#values which returns iterator )
 *
 * @returns {Array}
 */
xSet.prototype.toArray = function() {
  return [...this.s]
}

/**
 * Create an xSet with only the first element, if any
 *
 * @returns {xSet} - always a new object
 */
xSet.prototype.first = function() {
  return xSet([...this.s].slice(0, 1))
}

/**
 * Union operation
 * parameter can be single value or iterable (including another Set/xSet instance)
 *
 * @param values
 * @returns {xSet} - always a new object
 */
xSet.prototype.AND = function(other) {
  return xSet([...argToArray(other)].filter(x => this.has(x)))
}

/**
 * XOR operation
 * parameter can be single value or iterable (including another xSet instance)
 *
 * @param other
 * @returns {xSet} - always a new object
 */
xSet.prototype.XOR = function(other) {
  if (!other) {
    // clone self
    return xSet(this)
  }

  if (!(other instanceof Set)) {
    other = new Set(other)
  }

  // do XOR on contained values
  return xSet([
    ...[...this].filter(x => !other.has(x)),
    ...[...other].filter(x => !this.has(x))
  ])
}

/**
 * Return true if underlying values are the same in Sets' keys terms.
 * If `other` is array or iterable - order of elements doesn't matter.
 * as it gets through xSet constructor.
 *
 * parameter can be single value or iterable (including another xSet instance)
 *
 * @param other
 * @returns {Boolean}
 */
xSet.prototype.equal = function(other) {
  return this.XOR(other).size() === 0
}

/**
 * ---------------- Helpers ----------------
 */

function isIterable(obj) {
  // checks for null and undefined
  if (obj == null) {
    return false
  }
  return typeof obj[Symbol.iterator] === 'function'
}

/**
 * Special flavour of convert argument into an Array:
 * Strings and non-iterables are wraped into a single item array
 */
function argToArray(arg) {
  const t = typeof arg
  if (t === 'undefined') {
    return []
  }

  if (t === 'string' || arg instanceof String) {
    return [arg]
  }

  if (isIterable(arg)) {
    return Array.isArray(arg) ? arg : [...arg]
  }

  return [arg]
}

export default xSet
