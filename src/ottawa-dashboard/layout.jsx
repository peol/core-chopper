import React from 'react';

// import HighScore from './high-score';
import Stats from '../dashboard/stats';
// import Player from './player';
import PowerChart from '../dashboard/power-chart';
// import CaloryChart from './calory-chart';

import './layout.css';

export default function ({ player, socket }) {
  return (
    <div className="dashboard">
      <Stats />
      {/*
      <Player player={player} socket={socket} />
      <HighScore player={player} distinct />
  <CaloryChart player={player} /> */}
      <PowerChart player={player} />
    </div>
  );
}
