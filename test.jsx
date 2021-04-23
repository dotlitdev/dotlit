return (async args => {

  const React = (await import('https://cdn.skypack.dev/react')).default
  const { useState } = React
  
  const Clicker = props => {
    const [c,setC] = useState(0)
    console.log(React, useState, c)
    const click = e => false // setC(c+1)

    return <div onClick={click}>{ "Click count: "}</div>
  }

  return <Clicker/>
})()