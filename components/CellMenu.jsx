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


const CellMenuItem = ({title, icon, handler}) => {
    const Icon = icon
    const onClick = handler ? wrapHandler(handler) : null
    return <li title={title} key={title} onClick={onClick}>{<Icon/>}</li>
}

const isExecutable = (meta) => {
    return meta && (meta.repl || meta.lang === 'js')
}

const CellMenu = ({meta, editing, toggleEditing, save, execute} = {}) => {

    const [open, setOpen] = useState(false)
    const toggleOpen = wrapHandler(ev => {
        console.log("Toggle CellMenu", open)
        setOpen(!open)
    })

    return <menu>
        <ul className="menu__items">
            { open && isExecutable(meta) && <CellMenuItem title="Execute" icon={ExecIcon} handler={execute}/>}
            { open && !editing && <CellMenuItem title="Edit" icon={EditIcon} handler={toggleEditing}/>}
            { open && editing && <CellMenuItem title="Cancel" icon={CloseIcon} handler={toggleEditing}/>}
            { open && editing && <CellMenuItem title="Save" icon={SaveIcon} handler={save}/>}
            { !open 
                ? <CellMenuItem title="Open" icon={MenuIcon} handler={toggleOpen} />
                : <CellMenuItem title="Close" icon={CloseIcon} handler={toggleOpen} /> }
        </ul>
    </menu>
}

export default CellMenu
