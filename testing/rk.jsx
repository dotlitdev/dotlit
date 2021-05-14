import Embed from 'https://cdn.skypack.dev/runkit-embed-react'

export const viewer = ({node,React}) => {
  const {useState} = React
  const [url, setUrl] = useState(false)
  const meta = node?.propertie?.meta || {}

  const onLoad = async (rk) => {
     if (meta.mode === 'endpoint')
       setUrl(await rk.getEndpointURL())
  }

  return url || <Embed
            mode={meta.mode || 'default'}
            readOnly={true}
            evaluateOnLoad={true}
            // hidesActionButton={true}
            source={ node.data.value } 
            // ref='embed'
            onLoad={ onLoad } 
          />

}