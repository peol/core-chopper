import React from 'react';
import { useModel, useLayout } from 'hamus.js';

import './stats.css';

const genericProps = {
  qInfo: {
    qType: 'stats',
  },
  nbrOfPlayers: { qStringExpression: 'COUNT(DISTINCT userid)' },
  nbrOfFlights: { qStringExpression: 'COUNT(DISTINCT gameid)' },
  avgSpeed: { qStringExpression: 'AVG(speed)' },
  avgCadence: { qStringExpression: 'AVG(cadence)' },
};

export default function ({ app }) {
  const [layout] = useLayout(useModel(app, genericProps)[0]);

  if (!layout) {
    return (<p>Loading...</p>);
  }

  const avgSpeed = +layout.avgSpeed || 0;
  const avgCadence = +layout.avgCadence || 0;
  return (
    <div className="card stats">
      <h2>Stats</h2>
      <p>
A total of
        {' '}
        <strong>{layout.nbrOfPlayers}</strong>
        {' '}
players has flown
        {' '}
        <strong>{layout.nbrOfFlights}</strong>
        {' '}
runs, averaging a speed of
        {' '}
        <strong>
          {Math.round(avgSpeed * 18 / 5)}
        </strong>
        {' '}
km/h with an average cadence of
        {' '}
        <strong>
          {Math.round(avgCadence)}
        </strong>
.
      </p>
    </div>
  );
}
