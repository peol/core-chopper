import React from 'react';
import { useModel, useLayout } from 'hamus.js';

import './high-score.css';

const genericProps = {
  qInfo: { qType: 'highscore' },
  qHyperCubeDef: {
    qDimensions: [
      { qDef: { qFieldDefs: ['[userid]'] } },
      { qDef: { qFieldDefs: ['[name]'] } },
      {
        qDef: {
          qFieldDefs: ['[score]'],
          qReverseSort: true,
          qSortCriterias: [{ qSortByNumeric: true }],
        },
        qNullSuppression: true,
      },
      { qDef: { qFieldDefs: ['[bonus]'] } },
    ],
    qInitialDataFetch: [{
      qWidth: 4,
      qHeight: 10,
    }],
    qSuppressMissing: true,
    qInterColumnSortOrder: [2, 0],
  },
};

const genericPropsDistinct = {
  qInfo: { qType: 'highscore-distinct' },
  qHyperCubeDef: {
    qDimensions: [
      { qDef: { qFieldDefs: ['[userid]'] } },
      { qDef: { qFieldDefs: ['[name]'] } },
    ],
    qMeasures: [
      {
        qDef: {
          qDef: 'Max([score])',
          qReverseSort: true,
        },
        qSortBy: { qSortByNumeric: 1 },
      },
      { qDef: { qDef: 'FirstSortedValue([bonus],-[score])' } },
    ],
    qInitialDataFetch: [{
      qWidth: 4,
      qHeight: 20,
    }],
    qSuppressZero: true,
    qInterColumnSortOrder: [2, 0],
  },
};

export default function ({ app, player, distinct }) {
  const [layout] = useLayout(useModel(app, distinct ? genericPropsDistinct : genericProps)[0]);

  if (!layout) {
    return (<div className="card"><p>Loading...</p></div>);
  }

  const title = distinct ? 'Personal bests' : 'High scores';
  const matrix = layout.qHyperCube.qDataPages[0].qMatrix;

  let view;

  if (!matrix.length) {
    view = (
      <p>
No
        {' '}
        {title.toLowerCase()}
        {' '}
yet!
      </p>
    );
  } else {
    const rows = matrix
      .map((r, i) => {
        const classes = [r[0].qText === player.userid ? 'me' : ''];
        return (
          <tr key={r[0].qText + (r[3] || r[2]).qNum + distinct} className={classes}>
            <td>{i + 1}</td>
            <td>{r[1].qText}</td>
            <td>{r[3].qText}</td>
            <td>{r[2].qText}</td>
          </tr>
        );
      });
    view = (
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Bonus</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody>
          {rows}
        </tbody>
      </table>
    );
  }

  const classes = `card high-score distinct-${distinct}`;

  return (
    <div className={classes}>
      <h2>{title}</h2>
      {view}
    </div>
  );
}
