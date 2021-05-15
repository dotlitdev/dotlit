export const viewer = ({node, React}) => {
  const {useState, useEffect} = React
  const join = lit.utils.path.join

  const Stat = (props) => {
    const stat = props?.stat || {}
    if (stat.message) return <div>{stat.message}</div>
    return <div>
      Type: <span>{stat.type}</span> mtime: <span>{stat.mtimeMs}</span>
      {stat.contents && stat.contents.map( l => {

      const name = l[0]
      const type = l[1].type
      const style = type === 'dir'
                    ? {color: "red"}
                    : null
      return <div style={style}>{join(props.src,name)}</div>
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

  return <div>
     <input value={src} onChange={ev=>setSrc(ev.target.value)}/>
     <Stat src={src} stat={stat}/>
     {!stat && content}
     {stat && <button>Delete</button>}
     {stat && <button>Reset</button>}
     {stat && <button>Diff</button>}
    </div>
}