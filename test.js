const wait = (ms) => {
  return new Promise(resolve => {
    setTimeout( () => {
      resolve(new Date())
    }, ms)
     
  })
}
return wait(1000)