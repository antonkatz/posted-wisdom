import {isOfType} from "./isOfType.mjs";
import {HINGES_PARENT_PROP} from "./enter.mjs";

export function findAncestor(T, ofType) {
  const p = T?.[HINGES_PARENT_PROP]
  if (p != undefined) {
    if (isOfType(p, ofType)) {
      return p
    } else {
      return findAncestor(p, ofType)
    }
  } else {
    throw new Error('Cannot find ancestor with type')
    // throw new Error('Cannot find ancestor with type for hinge named `' + hinjName + '`')
  }
}