import Embed from 'https://cdn.skypack.dev/runkit-embed-react'

export const viewer = ({node,React}) => {

  const onLoad = (...args) => console.log([...args])

  return <Embed
            mode='endpoint'
            readOnly={true}
            evaluateOnLoad={true}
            // hidesActionButton={true}
            source={ node.data.value } 
            // ref='embed'
            onLoad={ onLoad } 
          />

}