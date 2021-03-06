import React from 'react'

export default class App extends React.Component {
    constructor(props) {
      super(props)
      this.state = {
          src: props.src
        }
      this.onChange = this.onChange.bind(this)
    }
  
    onChange(ev) {
      this.setState({src: ev.target.value})
    }
  
    render() {
      return <div id="content">{this.props.processor.processSync(this.state.src).result}</div>
    }
  }