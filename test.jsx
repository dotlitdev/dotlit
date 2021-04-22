return (async args => {

  const React = await import('https://cdn.skypack.dev/react')

  const Component = props => {
    return <div {...props}>React component</div>
  }

  return <Component 
           id="foo" 
           onClick={ e => alert("React")}/>
})()