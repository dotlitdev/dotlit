export const viewer = ({node,React}) => {

  const Embed = (await import('https://cdn.skypack.dev/runkit-embed-react')).default

  const onLoad = (...args) => alert(JSON.stringify([...args]))

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