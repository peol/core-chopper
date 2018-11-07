import React from 'react';

import useModel from '../hooks/model';
import useLayout from '../hooks/layout';

import './high-score.css';

const genericProps = {
  qInfo: {
    qType: 'highscore',
  },
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
      }],
    qInitialDataFetch: [{
      qWidth: 3,
      qHeight: 10,
    }],
    qSuppressMissing: true,
    qInterColumnSortOrder: [2, 0],
  },
};

const genericPropsDistinct = {
  qInfo: {
    qType: 'highscore-distinct',
  },
  qHyperCubeDef: {
    qDimensions: [
      { qDef: { qFieldDefs: ['[userid]'] } },
      { qDef: { qFieldDefs: ['[name]'] } },
    ],
    qMeasures: [{
      qDef: {
        qDef: 'Max([score])',
        qReverseSort: true,
      },
      qSortBy: { qSortByNumeric: 1 },
    }],
    qInitialDataFetch: [{
      qWidth: 3,
      qHeight: 15,
    }],
    qSuppressZero: true,
    qInterColumnSortOrder: [2, 0],
  },
};

export default function ({ player, distinct }) {
  const layout = useLayout(useModel(distinct ? genericPropsDistinct : genericProps));

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
          <tr key={r[0].qText + r[2].qNum + distinct} className={classes}>
            <td>{i + 1}</td>
            <td>{r[1].qText}</td>
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
            <th>Score</th>
          </tr>
        </thead>
        <tbody>
          {rows}
        </tbody>
      </table>
    );
  }

  return (
    <div className="card high-score">
      <h2>{title}</h2>
      {view}
    </div>
  );
}
