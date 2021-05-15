export const viewer = ({node, React}) => {
  const {useState, useEffect} = React
  const join = lit.utils.path.join

  const Stat = (props) => {
    const stat = props?.stat || {}
    if (stat.message) return <div>{stat.message}</div>
    return <div>
      Type: <span>{stat.type}</span> mtime: <span>{stat.mtimeMs}</span>
      {stat.contents && stat.contents.map( l => <div>{join(props.src,l)}</div>)}
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
          stat.contents = Promise.all((await lit.fs.readdir(src)).map( async l => await lit.fs.stat(join(src,l))))
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