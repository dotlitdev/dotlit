export const viewer = ({node, React}) => {

  const Stat = ({stat}={}) => {
  return <div>
    Type: <span>{stat.type}</span>
    mtime: <span>{stat.mtimeMs}</span>
  </div>
}


  const {useState, useEffect} = React
  const [content, setContent] = useState(<span>loading...</span>)
  // const [stat, setStat] = useState(undefined)
  const [src, setSrc] = useState(node.data.value.trim())
  const meta = node.properties.meta
  useEffect(async fn => {
    let stat
    try {
      stat = await lit.fs.stat(src)
      // setStat(stat)
    } catch(err) {
      setContent(<span>{err.message}</span>)
    }
  }, [src])
  return <div>
     <input value={src} onChange={ev=>setSrc(ev.target.value)}/>
     <Stat stat={stat}/>
     {content}
    </div>
}