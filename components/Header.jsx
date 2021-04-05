import React from 'react'

export const Header = props => {

   const [d,l,ex] = [
     'litDebug',
     typeof localStorage !== 'undefined' && localStorage,
     '*,fs,client,Cell,sections,etc...',
   ]
   const setDebug = ev => {
        ev.preventDefault()
        l.setItem( d, prompt(d, l.getItem(d) || ex) )
        return false
    }
    
    return <header>
                 <a href={props.root}>Home</a>
                 <span onClick={setDebug}>Debug</span>
            </header>
}