import React from  'react'

const B64_CODE_REGEX = /(data:text\/javascript;base64,(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?)/g

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
        hasError: false, 
        message: props.message || "Something went wrong."
    }
  }

  static getDerivedStateFromError(err) {
    // Update state so the next render will show the fallback UI.
    console.error(err)
    return { 
        hasError: true, 
        errorMessage: err.message, 
        errorStack: err.stack.replace( B64_CODE_REGEX, '[cell]')
    }
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    // logErrorToMyService(error, errorInfo);
    // console.log("Error Info: ", errorInfo)
  }

  render() {
    return this.state.hasError
        ? <details>
            <summary>{this.state.message}</summary>
            <pre>{this.state.errorStack}</pre>
        </details>
        : this.props.children
  }
}