import React, { useState } from 'react'
import * as clipboard from "clipboard-polyfill"

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

const LED = ({color,status, size = "0.6em", margin = "0.4em"}) => {

  return <span title={status} style={{
    display: "inline-block",
    width: size,
    height: size,
    borderRadius: size,
    marginTop: margin,
    backgroundColor: color,
  }}></span>
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



export const Header = props => {
  console.log('<Header/>', props)

  const resetFile = ctx => async ev => {
    console.log("Reset File:", ctx.file)
    if (confirm(`Are you sure you want to delete the local copy of "${ctx.file}"`)) {
      await ctx.fs.unlink('/' + ctx.file)
      console.log("Deleted ", ctx.file, "reloading page")
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

  const light = typeof localStorage === 'undefined'
    ? <LED color="#cccccc" title="Status"/>
    : props.times && (props.times.local && !props.times.remote )
      ? <LED color="orange" title="Status"/>
      : props.times && !props.times.local
        ? <LED color="red" title="Status"/>
        : <LED color="#33cc33" title="Status"/>

  return <SelectionContext.Consumer>{(ctx) => {

    const cellSelected = (ctx.selectedCell && ctx.selectedCell.start) || false

    return <Menu title="Home" horizontal href={props.root}>
    <Menu title="File">
      <span disabled className="meta">{props.ageMessage}</span>
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
      <span disabled>Remove</span>
      <span disabled>Edit</span>
      <span disabled>Execute</span>
      <span disabled>Reset</span>
      <Menu title="Move">
        <span disabled>Up</span>
        <span disabled>Down</span>
      </Menu>
      <Menu title="Copy">
        <span disabled>Source</span>
        <span disabled>Cell</span>
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
    <Menu right title={light}>
      {props.file && 
        <span disabled>{`File: ${props.file}`}</span>}
    { props.times && props.times.local && 
        <span disabled>{`Local last updated ${props.times.local}`}</span> }
    { props.times && props.times.remote && 
        <span disabled>{`Remote last updated ${props.times.remote}`}</span> }
      { props.times && props.times.ageMessage && 
        <span disabled>{`Local is ${props.times.ageMessage} than remote.`}</span> }
      { cellSelected && 
        <span disabled>{`Lines ${ctx.selectedCell.start.line}-${ctx.selectedCell.end.line}`}</span> }

    </Menu>
  </Menu>
  }}
</SelectionContext.Consumer>
}
