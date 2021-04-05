
// const {Console} = require('console')

const { NoOp } = require("./functions");


const debug_level = () => typeof process !== 'undefined' ? parseInt(process.env.DEBUG || 0, 10) : 99;

// const level = function(level, fn) {
//   const lvlIndent = Array(level).fill('  ').join('')
//   return function(...args) {
//     if (level <= debug_level()) fn(`[lit]{${level}}${lvlIndent}`, ...args)
//   }
// }

// // Custom console, which always outputs to stderr,
// // leaving stdout for program output.

// const custom_console = new Console(typeof process !== 'undefined' ? {
//   stdout: process.stderr,
//   stderr: process.stderr
// } : undefined)

// custom_console.level = level
// module.exports = custom_console

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
  return keys.indexOf('*') >= 0 || keys.indexOf('All') >= 0 || keys.indexOf(ns) >= 0
}

const level = function(level, fn) {
  const lvlIndent = Array(level).fill('  ').join('')
  return function(...args) {
    if (level <= debug_level() || shouldLog(level)) fn(`[lit]{${level}}${lvlIndent}`, ...args)
  }
}

const Console = {
  level: level,
  log: console.log,
  dir: console.dir,
  info: console.info,
  error: console.error,
  time: console.time,
  timeEnd: console.timeEnd,
  getConsoleForNamespace,
}

function getConsoleForNamespace(ns) {
  if (shouldLog(ns)) {
    return Console
  } else {
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

module.exports = Console





