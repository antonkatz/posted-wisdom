import {HINGES_FACTORY_PROP} from "./enter.mjs";

export function isOfType(T, ofType) {
  // try {
    if (!T[HINGES_FACTORY_PROP]) return false

    // const exactMatch = T[HINGES_TYPE_PROP] === ofType
    const m = !!T[HINGES_FACTORY_PROP][ofType] || false
    return m
  // } catch (e) {
  //   console.log(e)
  // }
}