return (async args => {

  const confetti = await import('https://cdn.skypack.dev/canvas-confetti')

  confetti()
})()