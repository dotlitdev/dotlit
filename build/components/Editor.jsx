import React from 'react'
import {EditorState, EditorView, basicSetup} from "@codemirror/basic-setup"
import {Compartment} from '@codemirror/state'

// import {html} from "@codemirror/lang-html"
// import {oneDark} from "@codemirror/theme-one-dark"

//import {esLint} from "@codemirror/lang-javascript"
// @ts-ignore
//import Linter from "eslint4b-prebuilt"
//import {linter} from "@codemirror/lint"

//import {StreamLanguage} from "@codemirror/stream-parser"
//import {javascript} from "@codemirror/legacy-modes/mode/javascript"

const lineWrapping = new Compartment

export default class Editor extends React.Component {
    constructor(props) {
        super(props)
        this.editorRef = React.createRef();
        this.editorState = window.cms = EditorState.create({
            doc: props.src, 
            extensions: [
                basicSetup,
                EditorView.lineWrapping,
                EditorView.updateListener.of(this.onUpdate.bind(this))
            //   html(),
            //   oneDark
            //  linter(esLint(new Linter)),
            //  StreamLanguage.define(javascript),
            ]
        })
    }

    onUpdate(viewUpdate) {
        if (this.props.update && typeof this.props.update === 'function') {
            this.props.update(viewUpdate.state.doc.toString())
        }
    }

    componentDidMount() {
        this.view = window.cmv = new EditorView({
            state: this.editorState, 
            parent: this.editorRef.current
        })
    }
    render() {
        return <div className="editor" ref={this.editorRef}></div>
    }
}