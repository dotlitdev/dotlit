return (async args => {

  const React = (await import('https://cdn.skypack.dev/react')).default
  const { useState } = React
  
  const Component = props => {
    const [c,setC] = useState(0)
    const click = e => setC(c+1)

    return <div onClick={click}>{ "Click count: " + c}</div>
  }

  return <Component/>
})()