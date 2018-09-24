import React from 'react';

import EnigmaModel from '../enigma/model';
import Stats from './stats';

import './high-score.css';

const genericProps = {
  qInfo: {
    qType: 'highscore',
  },
  qHyperCubeDef: {
    qDimensions: [
      { qDef: { qFieldDefs: ['name'] } },
      {
        qDef: {
          qFieldDefs: ['score'],
          qReverseSort: true,
          qSortCriterias: [{ qSortByNumeric: true }],
        },
      },
    ],
    qInitialDataFetch: [{
      qWidth: 2,
      qHeight: 10,
    }],
    qInterColumnSortOrder: [1, 0],
  },
};

export default class HighScore extends EnigmaModel {
  constructor() {
    super({ genericProps });
  }

  render() {
    const { layout } = this.state;
    if (!layout) {
      return (<p>Loading...</p>);
    }
    const matrix = layout.qHyperCube.qDataPages[0].qMatrix;
    if (!matrix.length) {
      return (<p>No highscores yet!</p>);
    }
    const rows = matrix
      .sort((a, b) => b[1].qNum - a[1].qNum)
    //      .slice(0, 5)
      .map((r, i) => (
        <tr key={r[0].qText + r[1].qNum}>
          <td>{i + 1}</td>
          <td>{r[0].qText}</td>
          <td>{r[1].qText}</td>
        </tr>
      ));
    return (
      <div className="high-score">
        <h2>High scores</h2>
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
        <Stats />
      </div>
    );
  }
}
