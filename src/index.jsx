import '@babel/polyfill';

import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';

import useSocket from './hooks/socket';
import usePlayer from './hooks/player';
import Header from './header';
import Dashboard from './dashboard/layout';
import Engine from './game/engine';

import './index.css';

// expose React globally, we need this to avoid
// it being removed by the experimental treeshaking
// algorithm in parcel:
window.React = React;

function Index() {
  const socket = useSocket();
  const player = usePlayer(socket);
  const [previousPlayer, setPreviousPlayer] = useState({});
  const [isStarted, setIsStarted] = useState(false);

  useEffect(() => {
    if (player.userid === previousPlayer.userid) {
      setIsStarted(true);
    }
    setPreviousPlayer(player);
  }, [player]);

  let view;

  if (!isStarted) {
    view = (<Dashboard player={player} socket={socket} />);
  } else {
    view = (<Engine player={player} socket={socket} />);
  }

  return (
    <div className="index">
      <Header player={player} />
      {view}
    </div>
  );
}

ReactDOM.render(
  <Index />,
  document.getElementById('app'),
);

if (module.hot) {
  // used for hot module replacement during development:
  module.hot.accept();
}
