
// const {Console} = require('console')

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


const level = function(level, fn) {
  const lvlIndent = Array(level).fill('  ').join('')
  return function(...args) {
    if (level <= debug_level()) fn(`[lit]{${level}}${lvlIndent}`, ...args)
  }
}

module.exports = {
  level: level,
  log: console.log,
  dir: console.dir,
  info: console.info,
  error: console.error,
  time: console.time,
  timeEnd: console.timeEnd
}





