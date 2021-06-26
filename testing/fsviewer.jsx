export const viewer = ({node, React}) => {
  const {useState, useEffect} = React
  const {join,extname} = lit.utils.path
  const [src, setSrc] = useState(node?.data?.value?.trim())
  const meta = node?.properties?.meta || {}

  const styles = {
    dir: {fontWeight: "bold"},
    '.lit': {color: 'blue'},
  }
  const getType = s => {
    const [filepath,stat] = s
    if (stat.type === 'file') {
      return extname(filepath)
    }
    return stat.type
  }

  const Stat = (props) => {
    const stat = props?.stat || {}
    if (stat.message) return <div>{stat.message}</div>
    return <div>
      <div style={{marginBottom: '0.4em'}}>Type: <span>{stat.type}</span> mtime: <span>{lit.utils.momento.MsToRelative(stat.mtimeMs - Date.now())}</span> Size: <span>{(props.size / 1024).toFixed(2)} KB</span></div>
      
      {stat.contents && stat.contents.map( l => {
      const name = l[0]
      const path = join(props.src,name)
      const type = getType(l)
      const style = styles[type] || null
      return <div><span onClick={ev=> props.select(path)} style={style}>{name}</span></div>
     })}
    </div>
  }

  const [content, setContent] = useState(<span>loading...</span>)
  const [stat, setStat] = useState(undefined)
  const [size, setSize] = useState(null)

  useEffect(async fn => {
    let stat, size
    try {
      stat = await lit.fs.stat(src)
      size = await lit.fs.du(src)
      if (stat.type === 'dir') {
          const list = await lit.fs.readdir(src)
          const withStats = list.map( async l => [l,await lit.fs.stat(join(src,l))])
          stat.contents = await Promise.all(withStats)
      }
      setStat(stat)
      setSize(size)
    } catch(err) {
      setStat(err)
      setSize(null)
    }
  }, [src])

  const bigger = {fontSize: '1em', width: '100%'}
  return <div style={bigger}>
     <input style={bigger} value={src} onChange={ev=>setSrc(ev.target.value)}/>
     <div style={{fontFamily: 'monospace', marginBottom: '0.4em'}}>
     <Stat src={src} stat={stat} size={size} select={setSrc}/>
     {!stat && content}
     </div>
     <button disabled={src === '/'} onClick={ev=>  setSrc(src.split('/').slice(0,-1).join('/') || '/')}>Back</button>
     {stat && <button onClick={ev=> confirm("Are you sure you want to delete local file: " + src) && lit.fs.unlink(src, true)}>Reset</button>}
     {stat && <button onClick={ev=> confirm("Are you sure you want to delete local and remote file: " + src) && lit.fs.unlink(src)}>Delete</button>}
     {stat && <button disabled>Diff</button>}
    </div>
}