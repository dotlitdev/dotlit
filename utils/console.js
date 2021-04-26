import { NoOp } from './functions'

const ROOT_NS = '.lit'
const ROOT_PREFIX = `[${ROOT_NS}] `

const debugKeys = (...args) => {
  let debugStr = ''
  if (typeof process !== 'undefined' && process.env && process.env.DEBUG) {
    debugStr = process.env.DEBUG
  }

  if (typeof window !== 'undefined' && window.location) {
      const debugKeys = localStorage.getItem('litDebug') || ''
      if (debugKeys) debugStr = debugKeys
  }

  return debugStr.split(',')
}

console.log("DEBUG:", debugKeys() )

const shouldLog = ns => {
  const keys = debugKeys()
  if (keys.indexOf(`-${ns}`) >= 0) return false;
  return keys.indexOf('*') >= 0 || keys.indexOf('All') >= 0 || keys.indexOf(ns) >= 0
}

const level = function(level, fn) {
  const lvlIndent = Array(level).fill('  ').join('')
  return function(...args) {
    if (level <= debug_level() || shouldLog(level)) fn(`[lit]{${level}}${lvlIndent}`, ...args)
  }
}

const prefixArgs = (prefix, fn, self) => {
  return (...args) => {
    const newArgs = [prefix, ...args]
    fn.apply( self, newArgs)
  }
}

const getConsole = (ns) => {
  const prefix = `[${ns}] `
  return {
    level: level,
    log: prefixArgs(prefix, console.log, console),
    dir: console.dir,
    info: console.info,
    error: console.error,
    time: console.time,
    timeEnd: console.timeEnd,
    getConsoleForNamespace,
  }
}

export const Console = getConsole(ROOT_NS);
export function getConsoleForNamespace(ns) {
  console.log(ROOT_PREFIX + "Getting console for NS:", ns)
  if (shouldLog(ns)) {
    return getConsole(ns)
  } else {
    console.log(ROOT_PREFIX + "Hiding console for NS", ns)
    return {
      level: NoOp,
      log: NoOp,
      dir: NoOp,
      info: NoOp,
      error: NoOp,
      time: NoOp,
      timeEnd: NoOp,
    }
  }
}




