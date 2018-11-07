import React from 'react';

import './error-boundary.css';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidCatch(error, info) {
    this.setState({ error, info });
  }

  render() {
    const { error, info } = this.state;
    const { children } = this.props;
    if (error) {
      return (
        <div className="error">
          <h1>Something went wrong.</h1>
          <code>
            <pre>
              {error.stack}
              {' '}
              {info.componentStack}
            </pre>
          </code>
        </div>
      );
    }
    return children;
  }
}
