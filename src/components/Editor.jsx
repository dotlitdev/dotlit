import React from 'react'
import {EditorState, EditorView, basicSetup} from "@codemirror/basic-setup"
import {Compartment} from '@codemirror/state'
import {autocompletion} from "@codemirror/autocomplete"

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
        const {src, update, links = [{src: 'testing/links', title: 'Testing Link autocompletions'}]} = props;
        this.editorRef = React.createRef();

        const linkOptions = links.map( l => ({label: link.src, type: 'link', detail: link.title, info: 'Additional info'}))

        this.editorState = window.cms = EditorState.create({
            doc: props.src, 
            extensions: [
                basicSetup,
                EditorView.lineWrapping,
                EditorView.updateListener.of(this.onUpdate.bind(this)),
                autocompletion({
                    override: [function (context) {
                        let word = context.matchBefore(/\w*/)
                        console.log(word, context)
                        if(word.from == word.to && !context.explicit) return null
                        if (word.text === '[[') {
                            return {
                                from: word.from,
                                options: [
                                    // types: class, constant, enum, function, interface, keyword, method, namespace, property, text, type, and variable
                                    ...linkOptions
                                ]
                            }
                        }
                        return {
                            from: word.from,
                            options: [
                                {label: "match", type: "keyword"},
                                {label: "hello", type: "variable", info: "(World)"},
                                {label: "magic", type: "text", apply: "⠁⭒*.✩.*⭒⠁", detail: "macro"}
                            ]
                        }
                    }],
                    activateOnTyping: true,
                }),
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