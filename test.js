const wait = (ms) => {
  return new Promise(resolve => {
    setTimeout( () => resolve("done"), ms)
  })
}
return wait(1000)
