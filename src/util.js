/**
 * timestamp with random part
 */
export function ts() {
  const t = `${+new Date()}`
  const r = `00000000000${Math.floor(Math.random() * 1000000000000)}`.slice(-12)
  return `${t}-${r}`
}

export function toArray(x) {
  return Array.isArray(x) ? x : [x]
}

/**
 * Performs equality by iterating through keys on an object and returning false
 * when any key has values which are not strictly equal between the arguments.
 * Returns true when the values of all keys are strictly equal.
 */
export function shallowEqual(objA, objB) {
  if (objA === objB) {
    return true
  }

  if (
    typeof objA !== 'object' ||
    objA === null ||
    typeof objB !== 'object' ||
    objB === null
  ) {
    return false
  }

  var keysA = Object.keys(objA)
  var keysB = Object.keys(objB)

  if (keysA.length !== keysB.length) {
    return false
  }

  // Test for A's keys different from B.
  var bHasOwnProperty = hasOwnProperty.bind(objB)
  for (var i = 0; i < keysA.length; i++) {
    if (!bHasOwnProperty(keysA[i]) || objA[keysA[i]] !== objB[keysA[i]]) {
      return false
    }
  }

  return true
}

// function shallowCompare(instance, nextProps, nextState) {
//   return (
//     !shallowEqual(instance.props, nextProps) ||
//     !shallowEqual(instance.state, nextState)
//   )
// }

export default { ts, toArray, shallowEqual }
