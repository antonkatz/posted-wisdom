import {HINGES_PARENT_PROP} from "./enter.mjs";

export function exit(fn) {
  let watcher = null
  const caller = (T, args = undefined) => {
    if (T?.[HINGES_PARENT_PROP] !== undefined) {
      // everything is good
    } else {
      if (args != undefined) {
        throw new Error('Enter must be called with an HINGES object as the first argument OR with a single argument')
      } else {
        args = T
        T = null
      }
    }
    const opRes = fn(T, args)
    if (opRes === undefined) {
      throw new Error('Exit must return something')
    }
    if (watcher) watcher(opRes)
    return opRes
  }

  caller.debug = (tag, showStack = false) => {
    if (showStack) throw new Error('Not implemented')
    watcher = (res) => {
      console.debug(tag || '-exit-', res)
    }
    return caller
  }


  return caller
}