import React, { useState, useEffect } from 'react'
import * as clipboard from "clipboard-polyfill"
import source from 'unist-util-source'
import SelectionContext from './SelectionContext'
import { Identity } from '../utils/functions'
import { getConsoleForNamespace } from '../utils/console'
import { CloseIcon } from './Icons'
import { ErrorBoundary } from './ErrorBoundry'
import parser from '../parser'
import {version} from '../../package.json'

const console = getConsoleForNamespace('Header')

const setDebug = ev => {
  ev.preventDefault()
  const key = 'litDebug'
  const example = 'All,fs,client,Cell,sections,etc...'
  const storage = typeof localStorage !== 'undefined' && localStorage
  const val = prompt("Set debug mask", storage.getItem(key) || example)
  storage.setItem( key, val )
  console.log(`Set ${key} to "${val}"`)
  return false
}

const showInspector = ev => {
  console.log('Show mobile inspector')
  if (typeof eruda !== 'undefined' && eruda) eruda.show()
  else alert("🚨 Eruda console not available")
}

const LED = ({color,status}) => {
  return <span title={status} className={`led led-${color}`}></span>
}

const useHasMounted = () => {
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => {
    setHasMounted(true);
  }, []);
  return hasMounted;
}

const Status = ({local, remote, sw, gh}) => {
  const hasMounted = useHasMounted()
  if (!hasMounted) return <>
      <LED color={'grey'} title="Github" />
      <LED color={'grey'} title="Service Worker" />
      <LED color={'grey'} title="Status" />
    </>;

  const color = !hasMounted
    ? 'grey'
    : (local && !remote)
      ? 'orange'
      : (remote && !local) 
        ? 'blue'
        : (!remote && !local)
          ? 'red'
          : 'green'
  return <>
      <LED color={gh ? 'green' : 'grey'} title="Github" />
      <LED color={sw ? 'green' : 'grey'} title="Service Worker" />
      <LED color={color} title="Status" />
    </>
}

const Menu = props => {
  // console.log('<Menu/>', props.title,)
  const [open, setOpen] = useState(props.horizontal)
  const toggleOpen = _ => setOpen(!open)
  const disabled = props.disabled || (!props.onClick && !props.href && !props.children)

  const handleClickTitle = ev => {
    ev.stopPropagation()
    if (disabled) return false

    if (props.onClick) props.onClick()
    else if (props.href) location.href = props.href
    else toggleOpen()
    return false
  }

  const catchClicks = ev => {
    ev.stopPropagation()
    if (!disabled && !props.horizontal) {
      toggleOpen()
    }
    return false
  }

  const classes = [
    props.horizontal ? 'horizontal' : null,
    open ? 'open' : null,
    props.children ? 'has-children' : null,
    props.right ? 'right' : '',
  ].filter(Identity).join(' ')

  

  return <menu className={classes} disabled={disabled} onClick={catchClicks}>
    <li className={"MenuTitle"} key="menu-title" onClick={handleClickTitle}>
      { props.href
        ? <a href={props.href}>{props.title}</a>
        : props.title }
    </li>
    { !disabled && open && <li className="MenuItems">{ props.children }</li> }
  </menu>
}

const Message = ({message, setSelectedCell}) => {
  
  const scroll = ev => {
    console.log('[Message] ', message)
    setSelectedCell(message.location, true) 
    return false
  }
  const [hide, setHide] = useState(false);
  const dismiss = () => setHide(true)
  const [showAll, setShowAll] = useState(false)
  const toggleShowAll = ev => {
    setShowAll(!showAll)
    return false
  }

  const classes = [
    'lit-message',
    showAll && 'showall',
  ].filter(Identity).join(' ')

  return hide ? null : <div className={classes}>
    <span className="message" onClick={toggleShowAll}>{message.message}</span>
    <span className="name" onClick={scroll}>
      {message.name.split(':').slice(1).join(':')}
    </span>
    <span className="close"><CloseIcon onClick={dismiss}/></span>
  </div>
}

export const Header = ({ root, toggleViewSource, toggleModal}) => {
  console.log('<Header/>')

  const hasMounted = useHasMounted();
  const ssr = !hasMounted
  const [sw, setSw] = useState(null);

  const resetFile = (ctx, localOnly) => async ev => {
    const filepath = ctx.file.path
    console.log("Reset File:", filepath)
    const qualifier = localOnly ? "local" : "local And remote"
    if (confirm(`Are you sure you want to delete the ${qualifier} copy of "${filepath}"`)) {
      await ctx.fs.unlink(filepath, localOnly)
      console.log("Deleted " + filepath + " reload page")
      // location.reload()
    }
  }

  const copyToClipboard = ctx => ev => {
    clipboard.writeText(ctx.src)
    console.log("Copied src to clipboard")
  }

  const ghToken = typeof localStorage !== 'undefined' && localStorage.getItem('ghToken')
  const setGhToken = (ev) => {
    localStorage.setItem('ghToken', prompt("GitHub personal access token"))
  }
  
  const copyCell = ctx => ev => {
    const src = source(ctx.selectedCell,ctx.src)
    clipboard.writeText(src)
    console.log("Copied cell src to clipboard")
  }
  
  const deleteCell = ctx => ev => {
    console.log('Deleting cell at pos:', ctx.selectedCell)
    ctx.setSrc(ctx.selectedCell, '')
    ctx.selectCell(null)
  }

  const cutCell = ctx => ev => {
    console.log('Cutting cell at pos:', ctx.selectedCell)
    const src = source(ctx.selectedCell,ctx.src)
    clipboard.writeText(src)
    ctx.setSrc(ctx.selectedCell, '')
    ctx.selectCell(null)
  }

  const pasteAfterCell = ctx => async ev => {
    console.log('Pasting after cell at pos:', ctx.selectedCell)
    const src = source(ctx.selectedCell, ctx.src)
    const add = await clipboard.readText()
    ctx.setSrc(ctx.selectedCell, `${src}\n${add}`)
    ctx.selectCell(null)
  }

  const addCodeCell = ctx => ev => {
    console.log('Adding code cell after cell at pos:', ctx.selectedCell)
    const src = source(ctx.selectedCell, ctx.src)
    const add = "```js\n\n```"
    ctx.setSrc(ctx.selectedCell, `${src}\n\n${add}`)
    ctx.selectCell(null)
  }

  const clearCodeCell = ctx => ev => {
    console.log('Clearing code cell at pos:', ctx.selectedCell)
    const meta = source(ctx.selectedCell, ctx.src).split('\n')[0]
    const end = '```'

    ctx.setSrc(ctx.selectedCell, `${meta}\n${end}`)
  }

  const newFile = () => {
    const filename = prompt('Please enter a file name or path')
    if (filename) {
      location.href = lit.parser.utils.links.resolver( filename ).href + '?title=' + encodeURIComponent(filename);
    }
  }

  useEffect(async () => {
    const resp = await fetch('--sw').then( res => res.json().catch( err=> null) ).catch(err => null)
    setSw(resp)
  }, [])

  return <SelectionContext.Consumer>{(ctx) => {

    const cellSelected = (ctx.selectedCell && ctx.selectedCell.start) || false

    const local = ctx.file && ctx.file.data && ctx.file.data.times && ctx.file.data.times.local
    const remote = ctx.file && ctx.file.data && ctx.file.data.times && ctx.file.data.times.remote
    const ageMessage = ctx.file && ctx.file.data && ctx.file.data.times && ctx.file.data.times.ageMessage

      
    const menuPlugins = !ssr && ctx?.file?.data?.plugins?.menu
    const fileMenuPlugins = !ssr && ctx?.file?.data?.plugins?.["filemenu"]
    const cellMenuPlugins = !ssr && ctx?.file?.data?.plugins?.["cellmenu"]
    const sectionMenuPlugins = !ssr && ctx?.file?.data?.plugins?.["sectionmenu"]
    const helpMenuPlugins = !ssr && ctx?.file?.data?.plugins?.["helpmenu"]

    console.log('<Header/> plugins?', menuPlugins)

    return <div id="lit-header">
    <Menu title="Home" horizontal href={root}>
      <Menu title="File" disabled={ssr}>
        <span disabled className="meta">{ageMessage}</span>
        <span onClick={newFile}>New</span>
        <span disabled>Open</span>
        <span disabled>Save</span>
        <span onClick={toggleViewSource}>View Source</span>
        <span onClick={copyToClipboard(ctx)}>Copy</span>
        <span onClick={resetFile(ctx, true)}>Reset</span>
        <span onClick={resetFile(ctx)}>Delete</span>

        { !fileMenuPlugins ? null : fileMenuPlugins && Object.keys(fileMenuPlugins).map( key => <ErrorBoundary>{fileMenuPlugins[key](ctx, {React, Menu, toggleModal})}</ErrorBoundary>) }

      </Menu>
      <Menu title="Cell" disabled={!cellSelected}>
        <span disabled className="meta">
          {cellSelected && `Lines ${ctx.selectedCell.start.line}-${ctx.selectedCell.end.line}`}
        </span>
        <span disabled={!cellSelected} onClick={addCodeCell(ctx)}>Add Code</span>
        <span disabled={!cellSelected} onClick={deleteCell(ctx)}>Remove</span>
        <span disabled={!cellSelected} onClick={clearCodeCell(ctx)}>Empty Code</span>
        <span disabled>Edit</span>
        <span disabled>Execute</span>
        <Menu title="Move" disabled={!cellSelected}>
          <span disabled>Up</span>
          <span disabled>Down</span>
        </Menu>
        <span disabled={!cellSelected} onClick={copyCell(ctx)}>Copy</span>
        <span disabled={!cellSelected} onClick={cutCell(ctx)}>Cut</span>
        <span disabled={!cellSelected} onClick={pasteAfterCell(ctx)}>Paste After</span>

        { !cellMenuPlugins ? null : cellMenuPlugins && Object.keys(cellMenuPlugins).map( key => <ErrorBoundary>{cellMenuPlugins[key](ctx, {React, Menu , toggleModal})}</ErrorBoundary>) }
      </Menu>
      <Menu title="Section" disabled={!cellSelected}>
        <span disabled>Collapse</span>
        <span disabled>Remove</span>
        <Menu title="Move">
          <span disabled>Up</span>
          <span disabled>Down</span>
        </Menu>

        { !sectionMenuPlugins ? null : sectionMenuPlugins && Object.keys(sectionMenuPlugins).map( key => <ErrorBoundary>{sectionMenuPlugins[key](ctx, {React, Menu, toggleModal})}</ErrorBoundary>) }

      </Menu>
      
      { !menuPlugins ? null : menuPlugins && Object.keys(menuPlugins).map( key => <ErrorBoundary>{menuPlugins[key](ctx, {React, Menu, toggleModal})}</ErrorBoundary>) }
      
      <Menu title="Help" disabled={ssr}>
        { !helpMenuPlugins ? null : helpMenuPlugins && Object.keys(helpMenuPlugins).map( key => <ErrorBoundary>{helpMenuPlugins[key](ctx, {React, Menu, toggleModal})}</ErrorBoundary>) }
        <a href="/config.html?file=config.lit">Config</a>
        <Menu title="Debug">
            <span onClick={setDebug}>Set Mask</span>
            <span onClick={showInspector}>Show Inspector</span>
        </Menu>
      </Menu>
      <Menu right title={<Status local={local} remote={remote} sw={sw} gh={ctx?.fs?.ghOrigin}/>}>
        <span disabled>{`GitHub: ${ ctx?.fs?.ghOrigin ? 'Connected' : 'Not connected'}`}</span>
        <span disabled>{`Service Worker: ${ sw ? sw.version : ' not'} active.`}</span>
        {ctx.file && <span disabled>{`File: ${ctx.file.path}`}</span>}
        {local && <span disabled>{`Local last updated ${local}`}</span> }
        {remote && <span disabled>{`Remote last updated ${remote}`}</span> }
        {ageMessage && <span disabled>{`Local is ${ageMessage} than remote.`}</span> }
        {cellSelected && <span disabled>{`Lines ${ctx.selectedCell.start.line}-${ctx.selectedCell.end.line}`}</span> }
      </Menu>
    </Menu>
    {!ssr && <div className="lit-messages">
    { ctx.file.messages.map( m => {
        return <Message key={m.name} message={m} setSelectedCell={ctx.setSelectedCell} />
    } ) }
    </div> }
  </div>
  }}
</SelectionContext.Consumer>
}
