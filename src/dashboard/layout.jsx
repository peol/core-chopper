import React from 'react';

import HighScore from './high-score';
import Stats from './stats';
import Player from './player';
import PowerChart from './power-chart';
import CaloryChart from './calory-chart';

import './layout.css';

export default function ({ player, socket }) {
  return (
    <div className="dashboard">
      <HighScore player={player} />
      <Stats />
      <Player player={player} socket={socket} />
      <HighScore player={player} distinct />
      <CaloryChart player={player} />
      <PowerChart player={player} />
    </div>
  );
}
