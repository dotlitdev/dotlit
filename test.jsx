return (async args => {

  const React = (await import('https://cdn.skypack.dev/react')).default
  const { useState } = React
  
  const Clicker = props => {
    //const [c,setC] = useState(0)
    //console.log(React, useState, c)
    const click = e => alert("Clicked 🥳") // setC(c+1)

    return <button onClick={click}>{ "Click count: "}</button>
  }

  return <Clicker/>
})()