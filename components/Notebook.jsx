
import React from 'react'

import {Head} from './Head.jsx'
import {Header} from './Header.jsx'
import {LitDocument} from './LitDocument.jsx'

import {parse} from '../parser'

export class Notebook extends React.Component {
    render() {
        return (<html>
            <Head title={this.props.title}/>
            <body>
                <Header />
                <LitDocument src={this.props.src}/>
            </body>
        </html>)
    }
}

