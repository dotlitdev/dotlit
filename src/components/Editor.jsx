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
        const {src, update} = props;
        this.editorRef = React.createRef();

        const linkOptions = lit.manifest.nodes.filter(n=>(n.exists && (n.id.endsWith('.lit') || n.id.endsWith('.md')))).map( n => {
            const id = n.id.slice(1).replace(/\.lit|\.md$/, '')
            return {
                label: '[[' + id + ']]' , 
                type: 'link', 
                detail: n.title,
                apply: '[[' + id + '|' + n.title
            }
        })

        this.editorState = window.cms = EditorState.create({
            doc: props.src, 
            extensions: [
                basicSetup,
                EditorView.lineWrapping,
                EditorView.updateListener.of(this.onUpdate.bind(this)),
                autocompletion({
                    override: [function (context) {
                        let word = context.matchBefore(/\S*/)
                        console.log(word, context)
                        if(word.from == word.to && !context.explicit) return null
                        if (word.text.startsWith('[[')) {
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
                                {label: "toc", type: "keyword", apply: "Table of contents"},
                                {label: "`", type: "variable", info: "Fenced code block", apply:"```\n\n```},
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
