export const viewer = ({children,node, React}) => {

  const ch = children
  const chc = ch[0].props.children
  const rc = React.createElement
  const np = node.properties

  const meta = np && np.meta
  const dirs = meta && meta.directives
  const tags = meta && meta.tags
  
  const dc = dirs && dirs.map(d=>'dir-'+d)
  const tc = tags && tags.map(t=>'tag-'+t)

  const classes = ['md-block']
  const add = arr => arr.forEach( c => { 
                        classes.push(c)
                     })
  if (dc) add(dc)
  if (tc) add(tc)

  const className = classes
                    .filter(x=>x)
                    .join(' ')
                    .trim()

  return rc('div', {className}, chc)
}
