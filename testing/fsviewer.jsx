export const viewer = ({node, React}) => {
  const {useState, useEffect} = React
  const [content, setContent] = useState(<span>loading...</span>)
  const [type, setType] = useState(undefined)
  const [src, setSrc] = useState(node.data.value.trim())
  const meta = node.properties.meta
  useEffect(async fn => {
    let stat
    try {
      stat = await lit.fs.stat(src)
      setType(stat.type)
    } catch(err) {
      setContent(<span>{err.message}</span>)
    }
  }, [src])
  return <div>
     <input value={src} onChange={ev=>setSrc(ev.target.value)}/>
     <div>Type: {type}</div>
     {content}
    </div>
}