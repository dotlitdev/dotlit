return (async args => {

const React = await import('https://cdn.skypack.dev/react')

const Component = props => {
  return <div {...props}></div>
}

return <Component id="foo"/>
})()