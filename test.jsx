return (async args => {

  const React = await import('https://cdn.skypack.dev/react')
  const u = React.useState
  const [c,setC] = u(0)
  const click = e => setC(c+1)
  const Component = props => {
    return <div onClick={click}>{ "Click count: " + c}</div>
  }

  return <Component/>
})()