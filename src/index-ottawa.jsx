import '@babel/polyfill';

import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useIdle } from 'react-use';

import useSocket from './hooks/socket';
import usePlayer from './hooks/player';
import ErrorBoundary from './error-boundary';
import Header from './header';
import Overlay from './overlay';
import Engine from './game/engine';
import OttawaDashboard from './ottawa-dashboard/layout';

import './ottawa.css';

// expose React globally, we need this to avoid
// it being removed by the experimental treeshaking
// algorithm in parcel:
window.React = React;

function Index() {
  const socket = useSocket();
  const player = usePlayer(socket);
  const [previousPlayer, setPreviousPlayer] = useState({});
  const [isStarted, setIsStarted] = useState(false);
  const isIdle = useIdle(30000);
  useEffect(
    () => {
      if (player.userid === previousPlayer.userid) {
        setIsStarted(true);
      }
      setPreviousPlayer(player);
    },
    [player],
  );

  let view;

  if (!isStarted) {
    view = <OttawaDashboard player={player} socket={socket} />;
  } else {
    view = <Engine player={player} socket={socket} />;
  }

  return (
    <div className="index">
      <Header player={player} socket={socket} />
      {view}
      {!isStarted && isIdle ? <Overlay /> : null}
    </div>
  );
}

ReactDOM.render(
  <ErrorBoundary>
    <Index />
  </ErrorBoundary>,
  document.getElementById('app'),
);

if (module.hot) {
  // used for hot module replacement during development:
  module.hot.accept();
}
