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

      this.save = this.save.bind(this)
    }

    save() {
        console.log('save', this.editorState.doc)
        this.props.update(this.editorState.doc.toString())
    }

    componentDidMount() {
        this.view = new EditorView({
            state: this.editorState, 
            parent: this.editorRef.current
        })
    }
    render() {
        return <div className="editor" ref={this.editorRef}>
            <button onClick={this.save}>Save</button>
        </div>
    }
}