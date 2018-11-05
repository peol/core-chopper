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
      { qDef: { qFieldDefs: ['[userid]'] } },
      { qDef: { qFieldDefs: ['[name]'] } },
      {
        qDef: {
          qFieldDefs: ['score'],
          qReverseSort: true,
          qSortCriterias: [{ qSortByNumeric: true }],
        },
      }],
    qInitialDataFetch: [{
      qWidth: 3,
      qHeight: 10,
    }],
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
    qInterColumnSortOrder: [2, 0],
  },
};

export default class HighScore extends EnigmaModel {
  constructor({ player, distinct }) {
    super({ genericProps: distinct ? genericPropsDistinct : genericProps });
    this.state = { player, distinct };
  }

  componentWillReceiveProps({ player }) {
    this.setState({ player });
  }

  render() {
    const { player, layout, distinct } = this.state;
    if (!layout) {
      return (<div className="card"><p>Loading...</p></div>);
    }
    const title = distinct ? 'Personal bests' : 'High scores';
    const matrix = layout.qHyperCube.qDataPages[0].qMatrix;
    if (!matrix.length) {
      return (<p>No highscores yet!</p>);
    }
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
    return (
      <div className="card high-score">
        <h2>{title}</h2>
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
        {distinct ? '' : <Stats />}
      </div>
    );
  }
}
