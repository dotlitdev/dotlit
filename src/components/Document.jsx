import React from 'react'
import path from 'path'
import App from './App'
import Backlinks from './Backlinks'

export default class Document extends React.Component {
    render() {
        return (<html>
            <head>
                <title>{this.props.title}</title>
                <meta name="litsrc" value={this.props.path}/>
                <meta name="litroot" value={this.props.root}/>
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <link rel="stylesheet" href={path.join(this.props.root, 'style.css')}/>
                <script src={path.join(this.props.root, 'web.bundle.js')}/>
            </head>
            <body>
                <div id="app"><App {...this.props}/></div>
                <div id="backlinks"><Backlinks root={this.props.root} links={this.props.backlinks || []}/></div>
            </body>
        </html>)
    }
}
