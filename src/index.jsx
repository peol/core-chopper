import React from 'react';
import ReactDOM from 'react-dom';

import Header from './header';
import Dashboard from './dashboard/layout';
import Engine from './game/engine';

import './index.css';

// expose React globally, we need this to avoid
// it being removed by the experimental treeshaking
// algorithm in parcel:
window.React = React;

class Index extends React.Component {
  constructor() {
    super();
    this.state = {
      user: { userid: null, name: '' },
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
      this.setState({ user: result.data });
    }
  }

  done(user) {
    this.socket.send(JSON.stringify({
      type: 'set-user',
      data: user,
    }));
    this.setState({ user });
  }

  gameStarted() {
    this.socket.send(JSON.stringify({
      type: 'started',
      data: {},
    }));
  }

  gameEnded(score) {
    this.socket.send(JSON.stringify({
      type: 'ended',
      data: { score },
    }));
  }

  render() {
    const { user } = this.state;
    let view;
    if (!user.userid || !user.name) {
      view = (
        <Dashboard user={user} onDone={(...args) => this.done(...args)} />
      );
    } else {
      view = (
        <Engine
          user={user}
          onStarted={() => this.gameStarted()}
          onEnded={(...args) => this.gameEnded(...args)}
          registerListener={fn => this.registerListener(fn)}
        />
      );
    }
    // todo: fix this.setState({ user: { userid: null, name: null } })
    // need to tear down the game engine instance somehow
    /* eslint no-restricted-globals:0 */
    //
    return (
      <div className="index">
        <Header showBack={!!user} onClose={() => location.reload()} />
        {view}
      </div>
    );
  }
}

ReactDOM.render(
  <Index />,
  document.getElementById('app'),
);

if (module.hot) {
  // used for hot module replacement during development:
  module.hot.accept();
}
