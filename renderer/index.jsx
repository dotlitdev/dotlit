import path from 'path'

import unified from 'unified'
import remark2rehype from 'remark-rehype'
import doc from 'rehype-document'
import html from 'rehype-stringify'
import rehype2react from 'rehype-react'
import toHast from 'mdast-util-to-hast'
import ReactDOMServer from 'react-dom/server'
import React from 'react'

import {parse, processor as parserProcessor, stringify} from '../parser'
import log from '../utils/console'

import {Notebook} from '../components/Notebook.jsx'


class LitParagraph extends React.Component {
    render() {
        return <p className={'LitP'}>{this.props.children}</p>
    }
}

class LitLink extends React.Component {
    render() {
        const title = this.props.node.properties.title
        return <a className={"LitLink " + this.props.className}
            href={this.props.href}
            title={title}>
                {this.props.children}
            </a>
    }
}


export function processor(relroot, filepath) {
    return parserProcessor()
    .use(()=> ({}))
    .use(remark2rehype)
    .use(rehype2react, {
        Fragment: React.Fragment,
        createElement: React.createElement,
        passNode: true,
        components: {
            p: LitParagraph,
            a: LitLink
        }
    })
}

class Backlinks extends React.Component {
    render() {
        return <>
            <h4>Backlinks ({this.props.links.length})</h4>
            <ol>
                {this.props.links.map( (link) => {
                    return  <li><a title={link.title} href={path.join(this.props.root, link.url)}>{link.url}</a></li>
                })}
            </ol>
        </>
    }
}

export class HTML extends React.Component {
    render() {
        return (<html>
                <head>
                    <title>{this.props.title}</title>
                    <meta name="litsrc" value={this.props.path}/>
                    <meta name="litroot" value={this.props.root}/>
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

export class App extends React.Component {
    constructor(props) {
      super(props)
      this.state = {
          src: props.src
        }
      this.onChange = this.onChange.bind(this)
      this.processor = processor(this.props.root, this.props.path)
    }
  
    onChange(ev) {
      this.setState({src: ev.target.value})
    }
  
    render() {
      return (<>
        <textarea className="tmp" value={this.state.src} onChange={this.onChange} />
        <div id="preview">{this.processor.processSync(this.state.src).result}</div>
        </>)
    }
  }

export function renderToVfile(vfile, cmd, links) {

    const root = path.resolve( cmd.output )
    const dir = path.dirname( path.join(root, vfile.path) )
    const relroot = path.relative(dir, root) || '.'

    console.log(root, relroot, dir, vfile.path)

    const output = vfile;

    const notebook = <HTML
        title={vfile.stem}
        src={vfile.contents.toString()}
        root={relroot}
        path={vfile.path}
        backlinks={links}
    />

    output.contents = ReactDOMServer.renderToString(notebook)
    output.extname = '.html'
    return output
}
