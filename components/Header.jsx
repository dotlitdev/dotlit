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
}

const Menu = props => {
  console.log('<Menu/>', props.title, props)

  const [open, setOpen] = useState(props.horizontal)
  const toggleOpen = _ => setOpen(!open)

  const classes = [
    props.horizontal ? 'horizontal' : null,
    open ? 'open' : null,
  ].filter(Identity).join(' ')

  const handleClickTitle = ev => {
    ev.stopPropagation()
    if (props.onClick) props.onClick()
    else if (props.href) location.href = props.href
    else toggleOpen()
    return false
  }

  const catchClicks = ev => {
    ev.stopPropagation()
    if (!props.horizontal) {
      toggleOpen()
    }
    return false
  }

  const disabled = !props.onClick && !props.href && !props.children

  return <menu className={classes} disabled={disabled} onClick={catchClicks}>
    <li className={"MenuTitle"} key="menu-title" onClick={handleClickTitle} >
      { props.href
        ? <a href={props.href}>{props.title}</a>
        : props.title}
      { ! props.horizontal && <span>&rsaquo;</span> }
    </li>
    { open && <li className="MenuItems">{ props.children }</li> }
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

  return <SelectionContext.Consumer>{(ctx) => {
    return <Menu title="Home" horizontal href={props.root}>
    <Menu title="File">
      <span disabled>New</span>
      <span disabled>Open</span>
      <span disabled>Save</span>
      <span onClick={copyToClipboard(ctx)}>Copy</span>
      <span onClick={resetFile(ctx)}>Reset</span>
      <span disabled>Delete</span>
    </Menu>
    <Menu title="Cell">
      <span disabled>Add</span>
      <span disabled>Remove</span>
      <span disabled>Edit</span>
      <span disabled>Execute</span>
      <span disabled>Reset</span>
      <Menu title="Move">
        <span disabled >Up</span>
        <span disabled >Down</span>
      </Menu>
      <Menu title="Copy">
        <span disabled >Source</span>
        <span disabled >Cell</span>
      </Menu>
    </Menu>
    <Menu title="Section">
      <span disabled>Collapse</span>
      <span disabled>Remove</span>
      <Menu title="Move">
        <span disabled >Up</span>
        <span disabled >Down</span>
      </Menu>
    </Menu>
    <Menu title="Help">
      <Menu title="Debug">
          <span onClick={setDebug}>Set Mask</span>
          <span onClick={showInspector}>Show Inspector</span>
      </Menu>
    </Menu>
  </Menu>
  }}
</SelectionContext.Consumer>
}
