import React, { useState } from 'react'
import { Identity } from '../utils/functions'
import { getConsoleForNamespace } from '../utils/console'

const console = getConsoleForNamespace('Header')

const setDebug = ev => {
  ev.preventDefault()
  const key = 'litDebug'
  const example = '*,fs,client,Cell,sections,etc...'
  const storage = typeof localStorage !== 'undefined' && localStorage
  const val = prompt(key, storage.getItem(key) || example)
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
    if (props.onClick) props.onClick()
    else if (props.href) location.href = props.href 
    else toggleOpen()
  }

  const disabled = !props.onClick && !props.href && !props.children

  return <menu className={classes} disabled={disabled}>
    <li className={"MenuTitle"} key="menu-title" onClick={handleClickTitle} >
      { props.href
        ? <a href={props.href}>{props.title}</a>
        : props.title}
      { open && props.horizontal && <span>|</span> }
    </li>
    { open && <li className="MenuItems">{ props.children }</li> }
  </menu>
}



export const Header = props => {
  console.log('<Header/>', props)
  return <Menu title="Home" horizontal href={props.root}>
    <Menu title="File">
      <span disabled>New</span>
      <span disabled>Open</span>
      <span disabled>Save</span>
      <span disabled>Reset</span>
      <span disabled>Delete</span>
    </Menu>
    <Menu title="Cell">
      <span disabled>Add</span>
      <span disabled>Remove</span>
      <span disabled>Edit</span>
      <span disabled>Execute</span>
      <span disabled>Reset</span>
      <Menu title="Move">
        <span>Up</span>
        <span>Down</span>
      </Menu>
      <Menu title="Copy">
        <span>Source</span>
        <span>Cell</span>
      </Menu>
    </Menu>
    <Menu title="Section">
      <span disabled>Collapse</span>
      <span disabled>Remove</span>
      <Menu title="Move">
        <span>Up</span>
        <span>Down</span>
      </Menu>
    </Menu>
    <Menu title="Help">
      <span onClick={setDebug}>Debug</span>
    </Menu>
  </Menu>
  
}
