import React from 'react';

import HighScore from './high-score';
import Stats from './stats';
import Player from './player';
import PowerChart from './power-chart';
import CaloryChart from './calory-chart';

import './layout.css';

export default function ({ app, player, socket }) {
  return (
    <div className="dashboard">
      <HighScore app={app} player={player} />
      <Stats app={app} />
      <Player app={app} player={player} socket={socket} />
      <HighScore app={app} player={player} distinct />
      <CaloryChart app={app} player={player} />
      <PowerChart app={app} player={player} />
    </div>
  );
}
