import '@babel/polyfill';

import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { useIdle, useAsync } from 'react-use';

import getDoc from './session';
import useSocket from './hooks/socket';
import usePlayer from './hooks/player';
import ErrorBoundary from './error-boundary';
import Header from './header';
import Overlay from './overlay';
import Dashboard from './dashboard/layout';
import Engine from './game/engine';

import './index.css';

// expose React globally, we need this to avoid
// it being removed by the experimental treeshaking
// algorithm in parcel:
window.React = React;

function Index() {
  const { value: app, error: appError } = useAsync(() => getDoc(), []);
  const socket = useSocket();
  const player = usePlayer(socket);
  const prevPlayer = useRef(null);
  const [isStarted, setIsStarted] = useState(false);
  const isIdle = useIdle(30000);

  useEffect(() => {
    if (player.userid && player.userid === prevPlayer.current.userid) {
      setIsStarted(true);
    }
    prevPlayer.current = player;
  }, [player]);

  let view;

  if (!app && !appError) {
    view = (<p>Loading...</p>);
  } else if (appError) {
    if (appError instanceof Error) {
      throw appError;
    }
    throw new Error('WebSocket failed to connect');
  } else if (!isStarted) {
    view = (<Dashboard app={app} player={player} socket={socket} />);
  } else {
    view = (<Engine app={app} player={player} socket={socket} />);
  }

  return (
    <div className="index">
      <Header app={app} player={player} socket={socket} />
      {view}
      {!isStarted && isIdle ? <Overlay /> : null}
    </div>
  );
}

ReactDOM.render(
  <ErrorBoundary><Index /></ErrorBoundary>,
  document.getElementById('app'),
);

if (module.hot) {
  // used for hot module replacement during development:
  module.hot.accept();
}
