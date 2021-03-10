import React from 'react'
import {EditorState, EditorView, basicSetup} from "@codemirror/basic-setup"
// import {html} from "@codemirror/lang-html"
// import {oneDark} from "@codemirror/theme-one-dark"

//import {esLint} from "@codemirror/lang-javascript"
// @ts-ignore
//import Linter from "eslint4b-prebuilt"
//import {linter} from "@codemirror/lint"

//import {StreamLanguage} from "@codemirror/stream-parser"
//import {javascript} from "@codemirror/legacy-modes/mode/javascript"



export default class Editor extends React.Component {
    constructor(props) {
        super(props)
        this.editorRef = React.createRef();
        this.editorState = EditorState.create({doc: props.src, extensions: [
        basicSetup,
      //   html(),
      //   oneDark
      //  linter(esLint(new Linter)),
      //  StreamLanguage.define(javascript),
      ]})
    }

    getState() {
        return this.editorState.doc.toString()
    }

    componentDidMount() {
        this.view = new EditorView({
            state: this.editorState, 
            parent: this.editorRef.current,
            lineWrapping: true,
        })

        if (this.props.getState) this.props.getState(this.getState.bind(this))
    }
    render() {
        return <div className="editor" ref={this.editorRef}></div>
    }
}