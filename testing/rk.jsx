import Embed from 'https://cdn.skypack.dev/runkit-embed-react'

export const viewer = ({node,React}) => {
  const {useState} = React
  const [url, setUrl] = useState(false)
  const meta = node?.propertie?.meta || {}
  const endpoint = meta.attrs && meta.attrs.mode === 'endpoint'

  const onLoad = async (rk) => {
     if (endpoint)
       setUrl(await rk.getEndpointURL())
  }

  return url || <Embed
            mode={meta.mode || 'default'}
            readOnly={endpoint}
            evaluateOnLoad={endpoint}
            hidesActionButton={endpoint}
            source={ node.data.value } 
            // ref='embed'
            onLoad={ onLoad } 
          />

}