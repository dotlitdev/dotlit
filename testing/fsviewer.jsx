export const viewer = ({node, React}) => {
  const {useState, useEffect} = React
  const join = lit.utils.path.join

  const Stat = (props) => {
    const stat = props?.stat || {}
    if (stat.message) return <div>{stat.message}</div>
    return <div>
      <div>{src} Type: <span>{stat.type}</span> mtime: <span>{lit.utils.momento.MsToRelative(stat.mtimeMs - Date.now())}</span></div>
      <div onClick={ev=>props.select(src.split('/').slice(0,-1).join('/') || '/')}>..</div>
      
      {stat.contents && stat.contents.map( l => {

      const name = join(props.src,l[0])
      const type = l[1].type
      const style = type === 'dir'
                    ? {fontWeight: "bold"}
                    : null
      return <div onClick={ev=> props.select(name)} style={style}>{name}</div>
     })}
    </div>
  }

  const [content, setContent] = useState(<span>loading...</span>)
  const [stat, setStat] = useState(undefined)
  const [src, setSrc] = useState(node?.data?.value?.trim())
  const meta = node?.properties?.meta || {}

  useEffect(async fn => {
    let stat
    try {
      stat = await lit.fs.stat(src)
      if (stat.type === 'dir') {
          const list = await lit.fs.readdir(src)
          const withStats = list.map( async l => [l,await lit.fs.stat(join(src,l))])
          stat.contents = await Promise.all(withStats)
      }
      setStat(stat)
    } catch(err) {
      setStat(err)
    }
  }, [src])

  const bigger = {fontSize: '1.2em'}
  return <div style={bigger}>
     <input style={{...bigger}, fontFamily: 'monospace'} value={src} onChange={ev=>setSrc(ev.target.value)}/>
     <Stat src={src} stat={stat} select={setSrc}/>
     {!stat && content}
     {stat && <button disabled>Reset</button>}
     {stat && <button onClick={ev=> confirm("Are you sure you want to delete " + src) && lit.fs.unlink(src)}>Delete</button>}
     {stat && <button disabled>Diff</button>}
    </div>
}