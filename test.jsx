const React = lit.utils.React
const { useState } = React
  
const Clicker = props => {
    const [c,setC] = useState(0)
    //console.log(React, useState, c)
    const click = e => setC(c+1)

    return <button onClick={click}>{ "Click me: " + c}</button>
}

return <Clicker/>