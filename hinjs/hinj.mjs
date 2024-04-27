import {enter, HINGES_ANCESTRY_PROP, HINGES_FACTORY_PROP} from './enter.mjs'
import {exit} from './exit.mjs'
import {isOfType} from "./isOfType.mjs";
import {findAncestor} from "./findAncestor.mjs";
import {RAW_STACK} from "./consts.mjs";

export {enter, exit}

export const ACCESSOR = Symbol('ACCESSOR')

/**
 * @template T {function(*, *=): *}
 * @template R {sync: T, async: T}
 * @param starting
 * @returns {{sync: T, async: T} & function(*, *=): *}
 */
let pi = 0
export function hinj(starting = undefined) {
  const pointer = Symbol(pi++)
  // const pointer = pi++
  // const pointer = Symbol(Math.random().toString())
  let stack = null

  const builder = (_this, args = undefined, remappedPointer = pointer) => {

    // const _stack = _this[HINGES_FACTORY_PROP][pointer]
    // const _this = !!_stack ? _startingThis : findAncestor(_startingThis, pointer)
    // this allows for extensions to be called
    // const remappedPointer = _stack[ACCESSOR]

    // const stack = remappedPointer === pointer ? definitionStack : _stack
    // const remappedPointer = isReferringToSelf ? pointer : stack[ACCESSOR]

    if (args !== undefined) {

      _this[remappedPointer] = args
      if (stack) {
        return stack(_this, args, remappedPointer)
      }

    } else {
      // when args are undefined we are not setting, only returning
      // unless there is a starting value which gets run through the chain once

      if (_this[remappedPointer] === undefined) {
        if (typeof starting == 'function') {
          _this[remappedPointer] = starting(_this)
        } else {
          _this[remappedPointer] = starting
        }
      }
      // stack && stack(_this, _this[p])
      return _this[remappedPointer]


    }
  }
  builder[ACCESSOR] = pointer
  builder[HINGES_ANCESTRY_PROP] = [pointer]


  builder.sync = (wfn) => {
    isAsyncMode = false

    if (wfn[ACCESSOR]) {
      // builder[HINGES_ANCESTRY_PROP] = [...builder[HINGES_ANCESTRY_PROP], pointer]
      builder[HINGES_ANCESTRY_PROP] = [...builder[HINGES_ANCESTRY_PROP], wfn[ACCESSOR]]
      wfn = wfn[RAW_STACK]
      if (!wfn) throw new Error('Must be a function')
    }

    if (!stack) {
      stack = (_t, v, p) => {
        const vNext = wfn(_t, v, p)
        return vNext //=== undefined ? v : vNext
      }
    } else {
      // existing function
      const pfn = stack
      stack = (_t, v, p) => {
        // v =
            pfn(_t, v, p)
        const vNext = wfn(_t, v, p)
        return vNext //=== undefined ? v : vNext
      }
    }

    return builder
  }

  let isAsyncMode = false
  builder.async = (wfn) => {

    if (wfn[ACCESSOR]) {
      builder[HINGES_ANCESTRY_PROP] = [...builder[HINGES_ANCESTRY_PROP], wfn[ACCESSOR]]
      wfn = wfn[RAW_STACK]
      if (!wfn) throw new Error('Must be a function')
    }

    // const next = wfn
    if (!stack) {
      stack = (_t, vP, p) => {
        // if (vP?.then) {
        //   vP.then(v => {
            const vNext = wfn(_t, vP, p)
          // })
        if (vNext?.then) {
          return vNext// === undefined ? v : vNext
        } else {
          throw new Error('Must be awaitable')
        }
      }
    } else {
      // existing function
      const pfn = !isAsyncMode ? stack : (_t, vP, p) => {
        return Promise.resolve(stack(_t, vP, p))
      }
      const next = (_t, v, p) => {
        const vNext = wfn(_t, v, p)
        if (vNext?.then) {
          return vNext //=== undefined ? v : vNext
        } else {
          throw new Error('Must be awaitable')
        }
      }

      stack = (_t, vP, p) => {
        // if (vP?.then) {
        const r = pfn(_t, vP, p)
          return r.then(() => next(_t, vP, p))
      }
    }

    isAsyncMode = true

    return builder
  }

  // TODO. must and debug should unwrap promises automatically

  //
  // builder.must = T => {
  //   // todo. this must be added to set watcher
  //   const v = T[p]
  //   if (v === undefined) {
  //     throw new Error('Not found')
  //   } else {
  //     return builder(T)
  //   }
  // }

  builder.debug = (tag, showStack = false) => {
    builder.sync((T, a) => {
      const v = T[pointer]
      const e = new Error()

      console.info(tag || '-state-', v)
      if (showStack) console.info(tag || '-state-', a, e)
    })

    return builder
  }

  return builder
}


