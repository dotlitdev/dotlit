return (async args => {

  const confetti = (await import("https://cdn.jsdelivr.net/npm/canvas-confetti@0.2.0-beta0/dist/confetti.module.mjs")).default
  // import('https://cdn.skypack.dev/canvas-confetti')

  confetti()
  return "yay"
})()