return (async args => {

  const React = await import('https://cdn.skypack.dev/react')
  
  const Component = props => {
    const u = React.useState
    const [c,setC] = u(0)
    const click = e => setC(c+1)

    return <div onClick={click}>{ "Click count: " + c}</div>
  }

  return <Component/>
})()