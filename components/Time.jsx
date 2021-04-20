import React, {useState, useEffect} from 'react'
import {MsToRelative} from '../utils/momento'

export const Time = ({ms}) => {

    const [now, setNow] = useState(Date.now())
    const delta = ms - now
    const relative = MsToRelative(delta)
    const [showAbsolute, setShowAbsolute] = useState(false)
    const toggle = (ev) => {
        ev.preventDefault()
        ev.stopPropagation()
        setShowAbsolute(!showAbsolute)
        return false
    }

    const val = showAbsolute 
                ? (new Date(ms)).toString() 
                : relative;

    useEffect(() => {
        const id = setTimeout(() => { setNow(Date.now()) }, 1000);
        return () => clearTimeout(id);
    }, [now]);

    return <span
        className={`Time ${showAbsolute ? 'absolute' : 'relative'}`}
        onClick={toggle}>
            {val}
        </span>
}