import React from 'react';
import ReactDOM from 'react-dom';

import Scan from './scan';
import Engine from './game/engine';

import './index.scss';

// expose React globally, we need this to avoid
// it being removed by the experimental treeshaking
// algorithm in parcel:
window.React = React;

class Index extends React.Component {
  constructor() {
    super();
    this.state = {
      user: { id: null, name: '' },
    };
    this.listeners = [];
    this.socket = new WebSocket('ws://localhost:8080');
    this.socket.onmessage = (...args) => this.socketData(...args);
  }

  registerListener(fn) {
    this.listeners.push(fn);
  }

  removeListener(fn) {
    const idx = this.listeners.indexOf(fn);
    this.listeners.splice(idx, 1);
  }

  socketData(evt) {
    const result = JSON.parse(evt.data);
    // console.log(data);
    this.listeners.forEach(l => l(result));
    if (result.type === 'nfc') {
      this.setState({ user: { id: result.data.id, name: 'none' }});
    }
  }

done(user) {
  this.setState({ user });
}

render() {
  const { user } = this.state;
  if (!user.id || !user.name) {
    return <Scan user={user} onDone={u => this.done(u)} />;
  }
  return <Engine user={user} registerListener={fn => this.registerListener(fn)} />;
}
}

ReactDOM.render(
  <div className="index">
    <Index />
  </div>,
  document.getElementById('app'),
);

if (module.hot) {
  // used for hot module replacement during development:
  module.hot.accept();
}
