import React, {useState} from "react"
import { MenuIcon, EditIcon, ExecIcon, CloseIcon, SaveIcon } from './Icons'
import { getConsoleForNamespace } from '../utils/console'

const console = getConsoleForNamespace('CellMenu')

const wrapHandler = fn => ev => {
    console.log("Cell menu wrapper", fn, ev)
    ev.preventDefault()
    ev.stopPropagation()
    if (typeof fn === 'function'){
        const resp = fn(ev)
        console.log("Cell menu wrapper fn executed", resp)
    }
    return false
}

const CellMenu = props => {

    const [open, setOpen] = useState(false)
    const toggleOpen = wrapHandler(ev => {
        console.log("Toggle CellMenu", open)
        setOpen(!open)
    })

    const items = [
        {title: "Execute", icon: ExecIcon, handler: wrapHandler(props.execute)}
    ]

    if (!props.editing) items.push({title: "Edit", icon: EditIcon, handler: wrapHandler(props.toggleEditing)})
    else {
        items.push({title: "Cancel", icon: CloseIcon, handler: wrapHandler(props.toggleEditing)})
        items.push({title: "Save", icon: SaveIcon, handler: wrapHandler(props.save)})
    }

    return <menu>
        <ul className="menu__items">
            { open && items.map( item => {
                const Icon = item.icon
                return <li title={item.title} key={item.title} onClick={item.handler}><Icon/></li>
            })}
            { !open 
                ? <li title="Open" key="open" onClick={toggleOpen}><MenuIcon/></li>
                : <li title="Close" key="close"onClick={toggleOpen}><CloseIcon/></li> }
        </ul>
    </menu>
}

export default CellMenu