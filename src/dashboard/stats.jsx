import React from 'react';

import useModel from '../hooks/model';
import useLayout from '../hooks/layout';

const genericProps = {
  qInfo: {
    qType: 'stats',
  },
  nbrOfPlayers: { qStringExpression: 'COUNT(DISTINCT userid)' },
  nbrOfFlights: { qStringExpression: 'COUNT(DISTINCT gameid)' },
  avgSpeed: { qStringExpression: 'AVG(speed)' },
  avgCadence: { qStringExpression: 'AVG(cadence)' },
};

export default function () {
  const layout = useLayout(useModel(genericProps));

  if (!layout) {
    return (<p>Loading...</p>);
  }

  const avgSpeed = +layout.avgSpeed || 0;
  const avgCadence = +layout.avgCadence || 0;
  return (
    <div className="stats">
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
