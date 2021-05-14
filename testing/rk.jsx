import Embed from 'https://cdn.skypack.dev/runkit-embed-react'

export const viewer = ({node,React}) => {
  const {useState} = React
  const [url, setUrl] = useState(false)

  const onLoad = async (rk) => setUrl(await rk.getEndpointURL())

  return url || <Embed
            mode='endpoint'
            readOnly={true}
            evaluateOnLoad={true}
            // hidesActionButton={true}
            source={ node.data.value } 
            // ref='embed'
            onLoad={ onLoad } 
          />

}