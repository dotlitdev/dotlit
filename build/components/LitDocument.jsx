import React from 'react'

import {parse, processor, stringify} from '../parser'


export class LitDocument extends React.Component {
    render () {    
        return <div className="content">
            {this.props.src}
        </div>
    }
}