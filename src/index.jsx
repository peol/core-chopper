import '@babel/polyfill';

import React from 'react';
import ReactDOM from 'react-dom';

import Socket from './socket';
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
    const socket = new Socket();
    this.updatedListener = player => this.setState({ player });
    this.scannedListener = (scannedPlayer) => {
      const { player } = this.state;
      if (player.userid === scannedPlayer.userid) {
        this.setState({ isStarted: true });
      } else {
        this.setState({ player: scannedPlayer });
      }
    };
    socket.on('player:saved', this.updatedListener);
    socket.on('player:scanned', this.scannedListener);
    this.state = { player: {}, socket };
  }

  componentWillUnmount() {
    const { socket } = this.state;
    socket.off('player:saved', this.updatedListener);
    socket.off('player:scanned', this.scannedListener);
  }

  render() {
    const { player, socket, isStarted } = this.state;
    let view;
    if (!isStarted) {
      view = (
        <Dashboard player={player} socket={socket} />
      );
    } else {
      view = (
        <Engine player={player} socket={socket} />
      );
    }
    return (
      <div className="index">
        <Header player={player} />
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
