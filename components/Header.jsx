import React, { useState } from 'react'
import * as clipboard from "clipboard-polyfill"
import source from 'unist-util-source'
import SelectionContext from './SelectionContext'
import { Identity } from '../utils/functions'
import { getConsoleForNamespace } from '../utils/console'


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

const Status = ({local, remote}) => {
  const color = (typeof window === 'undefined' || typeof window.localStorage === 'undefined)')
    ? 'grey'
    : (local && !remote)
      ? 'orange'
      : (remote && !local) 
        ? 'blue'
        : (!remote && !local)
          ? 'red'
          : 'green'
  return <LED color={color} title="Status" />
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



export const Header = (props) => {
  console.log('<Header/>', props)
  const { root, local, remote, ageMessage } = props

  const resetFile = ctx => async ev => {
    console.log("Reset File:", ctx.file.path)
    if (confirm(`Are you sure you want to delete the local copy of "${ctx.file.path}"`)) {
      await ctx.fs.unlink('/' + ctx.file.path)
      console.log("Deleted ", ctx.file.path, "reloading page")
      location.reload()
    }
  }

  const copyToClipboard = ctx => ev => {
    clipboard.writeText(ctx.src)
    console.log("Copied src to clipboard")
  }

  const ghToken = typeof localStorage !== 'undefined' && localStorage.getItem('ghToken')
  const setGhToken = (ev) => {
    localStorage.getItem('ghToken', prompt("GitHub personal access token"))
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

  const clearCodeCell = ctx => ev => {
    console.log('Clearing code cell at pos:', ctx.selectedCell)
    const meta = source(ctx.selectedCell, ctx.src).split('\n')[0]
    const end = '```'

    ctx.setSrc(ctx.selectedCell, `${meta}\n${end}`)
  }

  return <SelectionContext.Consumer>{(ctx) => {

    const cellSelected = (ctx.selectedCell && ctx.selectedCell.start) || false

    return <Menu title="Home" horizontal href={root}>
    <Menu title="File">
      <span disabled className="meta">{ageMessage}</span>
      <span disabled>New</span>
      <span disabled>Open</span>
      <span disabled>Save</span>
      <span onClick={copyToClipboard(ctx)}>Copy</span>
      <span onClick={resetFile(ctx)}>Reset</span>
      <span disabled>Delete</span>
    </Menu>
    <Menu title="Cell" disabled={!cellSelected}>
      <span disabled className="meta">
        {cellSelected && `Lines ${ctx.selectedCell.start.line}-${ctx.selectedCell.end.line}`}
      </span>
      <span disabled>Add</span>
      <span disabled={!cellSelected} onClick={deleteCell(ctx)}>Remove</span>
      <span disabled={!cellSelected} onClick={clearCodeCell(ctx)}>Empty Code</span>
      <span disabled>Edit</span>
      <span disabled>Execute</span>
      <span disabled>Reset</span>
      <Menu title="Move" disabled={!cellSelected}>
        <span disabled>Up</span>
        <span disabled>Down</span>
      </Menu>
      <Menu title="Copy">
        <span disabled>Source</span>
        <span disabled={!cellSelected} onClick={copyCell(ctx)}>Cell</span>
      </Menu>
    </Menu>
    <Menu title="Section" disabled={!cellSelected}>
      <span disabled>Collapse</span>
      <span disabled>Remove</span>
      <Menu title="Move">
        <span disabled>Up</span>
        <span disabled>Down</span>
      </Menu>
    </Menu>
    <Menu title="Help">
      <span disabled>About</span>
      <span disabled>Documentation</span>
      <span disabled={!ghToken} onClick={setGhToken}>GitHub Token</span>
      <Menu title="Debug">
          <span onClick={setDebug}>Set Mask</span>
          <span onClick={showInspector}>Show Inspector</span>
      </Menu>
    </Menu>
    <Menu right title={<Status local={local} remote={remote} />}>
      {ctx.file && 
        <span disabled>{`File: ${ctx.file.path}`}</span>}
    {local && 
        <span disabled>{`Local last updated ${local}`}</span> }
    {remote && 
        <span disabled>{`Remote last updated ${remote}`}</span> }
      {ageMessage && 
        <span disabled>{`Local is ${ageMessage} than remote.`}</span> }
      { cellSelected && 
        <span disabled>{`Lines ${ctx.selectedCell.start.line}-${ctx.selectedCell.end.line}`}</span> }

    </Menu>
  </Menu>
  }}
</SelectionContext.Consumer>
}
