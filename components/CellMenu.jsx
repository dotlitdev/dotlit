import React, {useState} from "react"

const wrapHandler = fn => ev => {
    ev.preventDefault()
    ev.stopPropagation()
    if (typeof fn === 'function') fn(ev)
    return false
}

const CellMenu = props => {

    const [open, setOpen] = useState(false)
    const toggleOpen = wrapHandler(ev => {
        console.log("Toggle CellMenu", open)
        setOpen(!open)
    })

    const items = [
        props.editing
            ? {title: "Cancel", icon: "⨯", handler: wrapHandler(props.toggleEditing)}
            : {title: "Edit", icon: "✎", handler: wrapHandler(props.toggleEditing)},
        {title: "Execute", icon: "▶", handler: wrapHandler(props.execute)}
    ]

    return <menu>
        <ul className="menu__items">
            { !open 
                ? <li title="Open" key="open" onClick={toggleOpen}>☰</li>
                : <li title="Close" key="close"onClick={toggleOpen}>⨯</li>}
            { open && items.map( item => <li title={item.title} key={item.title} onClick={item.handler}>{item.icon}</li>)}
        </ul>
    </menu>
}

export default CellMenu