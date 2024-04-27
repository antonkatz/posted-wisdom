import {HINJ_NAME, RAW_STACK} from "./consts.mjs";
import {isOfType} from "./isOfType.mjs";
import {ACCESSOR} from "./hinj.mjs";
import {findAncestor} from "./findAncestor.mjs";

export const HINGES_PARENT_PROP = Symbol('HINGES_PARENT_PROP')
export const HINGES_TYPE_PROP = Symbol('HINGES_TYPE_PROP')
export const HINGES_ANCESTRY_PROP = Symbol('HINGES_ANCESTRY_PROP')
export const HINGES_FACTORY_PROP = Symbol('HINGES_FACTORY_PROP')

/**
 * @template T
 * @param fn
 * @param {T} exports
 * @returns {T & function(*, *=): *}
 */
export function enter(fn, exports) {
  const objectType = Symbol(String.fromCharCode(Math.round(Math.random() * 29)) + Math.random())
  const caller = (PT, args = undefined) => {
    if (PT?.[HINGES_TYPE_PROP] != undefined) {
      // everything is good, it's a hinge object
    } else {
      if (args != undefined) {
        throw new Error('Enter must be called with an HINGES object as the first argument OR with a single argument')
      } else {
        args = PT
        PT = null
      }
    }

    const T = {
      [HINGES_PARENT_PROP]: PT || null,
      [HINGES_FACTORY_PROP]: caller,
      [HINGES_TYPE_PROP] : objectType
    }
    const opRes = fn && fn(T, args)
    // todo, should this ever return the opRes??
    // return opRes === undefined ? T : opRes
    return T
  }

  caller[HINGES_TYPE_PROP] = objectType

  // make sure not to let exported state be set from outside
  // const liftedExports = Object.fromEntries(Object.entries(exports).map(([k, v]) => [k, (T, args) => { if (args) throw new Error('Cannot set state from outside of definition file');return v(T)}]))
  const liftedExports = exports && processExports(exports, objectType)
  if (liftedExports && 'name' in liftedExports) {
    throw new Error('`name` is a reserved keyword that cannot be exported')
  }

  if (liftedExports) {
    for (const [name, fn] of Object.entries(liftedExports)) {
      for (const a of fn[HINGES_ANCESTRY_PROP]) {
        caller[a] = fn[RAW_STACK]
      }
    }
  }

  return liftedExports && Object.assign(caller, liftedExports) || caller
}

function processExports(exports, ofType) {
  const liftedExports = Object.fromEntries(
      Object.entries(exports)
          .map(([k, v]) => {
            if (v[RAW_STACK]) return [k,v]

            const isCommand = k.startsWith('do') && k[2] && k[2] === k[2].toUpperCase()

            if (!v[HINGES_TYPE_PROP]) {
              // throw new Error('Can only have 1 type : Likely a `hinj` lib bug')
              v[HINGES_TYPE_PROP] = ofType
            }
            v[HINGES_TYPE_PROP] = ofType
            const fn = (T, args, p) => {
              if (isCommand) {
                if (args === undefined) throw new Error('Must pass arguments or `null` to command')
              }
              // const TT = isOfType(T, k, ofType) ? T : findAncestor(T, k, ofType)
              // const TT = isOfType(T, k, v[ACCESSOR]) ? T : findAncestor(T, k, v[ACCESSOR])
              const pointer = p || v[ACCESSOR]
              const _stack = T[HINGES_FACTORY_PROP][pointer]
              const _this = !!_stack ? T : findAncestor(T, pointer)

              const stack = _stack || _this[HINGES_FACTORY_PROP][pointer]
              // const stack = !!p ? v : (_stack || _this[HINGES_FACTORY_PROP][pointer])

              return stack(_this, args, pointer)
              // stack(_this, args, stack[ACCESSOR])
            }

            fn[RAW_STACK] = v
            fn[HINJ_NAME] = k
            fn[HINGES_ANCESTRY_PROP] = v[HINGES_ANCESTRY_PROP]
            fn[ACCESSOR] = v[ACCESSOR]

            fn.has = (T) => {
              return isOfType(T, fn[ACCESSOR])
            }

            return [k, fn]
          }))
  return liftedExports
}