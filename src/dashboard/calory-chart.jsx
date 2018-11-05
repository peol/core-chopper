import React from 'react';
import picassoQ from 'picasso-plugin-q';
import picasso from 'picasso.js';

import EnigmaModel from '../enigma/model';

import './calory-chart.css';

picasso.use(picassoQ);

const TEXT_COLOR = '#333';
const SECONDARY_COLOR = '#111';

const genericProps = {
  qInfo: {
    qType: 'calories',
  },
  qHyperCubeDef: {
    qDimensions: [
      { qDef: { qFieldDefs: ['[userid]'] } },
      { qDef: { qFieldDefs: ['[name]'] } },
    ],
    qMeasures: [
      // Average watt/hour (power) * hours bicycled * 3.6 = kcal burnt
      {
        qDef: {
          qDef: 'Round(Avg([power]) * (Sum(Aggr(Max([duration]), [gameid])) / 1000 / 60 / 60) * 3.6)',
          qReverseSort: true,
        },
        qSortBy: { qSortByNumeric: 1 },
      },
    ],
    qInitialDataFetch: [{
      qWidth: 3,
      qHeight: 3333,
    }],
    qInterColumnSortOrder: [2, 1, 0],
    qSuppressMissing: true,
    qSuppressZero: true,
  },
};

const settings = {
  scales: {
    x: {
      data: {
        extract: {
          field: 'qDimensionInfo/0',
          value: v => v.qText,
          props: {
            name: { field: 'qDimensionInfo/1', value: v => v.qText },
          },
        },
      },
      label: v => v.datum.name.value,
      padding: 0.2,
    },
    y: {
      data: {
        field: 'qMeasureInfo/0',
      },
      expand: 0.35,
      invert: true,
    },
    c: {
      type: 'color',
      data: {
        extract: { field: 'qDimensionInfo/0', value: v => v.qText },
      },
      range: ['#2a4858', '#ff3900', '#ff6600', '#f01d2d', '#ff0b00', '#e93a06', '#bb99aa', '#da0a2f', '#cf6181', '#7717a9', '#283d6a', '#24247d', '#de405d', '#f79f02', '#ff9300', '#c47e9a', '#cc0d7e', '#ffc000', '#441e92', '#be10be'],
    },
  },
  components: [{
    key: 'y-axis',
    type: 'axis',
    scale: 'y',
    settings: {
      labels: {
        fontFamily: 'VT323',
        fill: TEXT_COLOR,
        fontSize: '18px',
      },
    },
  }, {
    key: 'x-axis',
    type: 'axis',
    scale: 'x',
    dock: 'bottom',
    settings: {
      labels: {
        fontFamily: 'VT323',
        fill: TEXT_COLOR,
        fontSize: '18px',
        mode: 'tilted',
        tiltAngle: 35,
      },
    },
  }, {
    key: 'grid',
    type: 'grid-line',
    y: { scale: 'y' },
  }, {
    key: 'bars',
    type: 'box',
    data: {
      extract: {
        field: 'qDimensionInfo/0',
        value: v => v.qText,
        props: {
          start: 0,
          end: { field: 'qMeasureInfo/0' },
        },
      },
    },
    settings: {
      major: { scale: 'x' },
      minor: { scale: 'y' },
      box: {
        fill: { scale: 'c' },
      },
    },
    brush: {
      consume: [{
        context: 'highlight',
        style: {
          active: {
            opacity: 1,
            stroke: SECONDARY_COLOR,
            strokeWidth: 5,
          },
          inactive: {
            opacity: 0.3,
          },
        },
      }],
    },
  }, {
    key: 'bar-labels',
    type: 'labels',
    settings: {
      sources: [{
        component: 'bars',
        selector: 'rect',
        strategy: {
          type: 'bar',
          settings: {
            fontFamily: 'VT323',
            fontSize: 24,
            align: 0.5,
            justify: 0,
            labels: [{
              label({ data }) {
                return data ? data.end.label : '';
              },
              placements: [
                { position: 'outside', fill: TEXT_COLOR },
              ],
            }],
          },
        },
      }],
    },
  }],
};

export default class CaloryChart extends EnigmaModel {
  constructor({ player }) {
    super({ genericProps });
    this.state = { player };
  }

  componentWillReceiveProps({ player }) {
    this.setState({ player });
  }

  async renderPicasso() {
    const { layout } = this.state;
    // const field = await this.getField('name');
    // await field.selectValues([{ qText: 'Andrée' }, { qText: 'Johan B' }]);

    const data = [{
      type: 'q',
      key: 'qHyperCube',
      data: layout.qHyperCube,
    }];

    this.resetChart = () => {
      const { player } = this.state;
      const brush = this.pic.brush('highlight');
      brush.clear();
      if (player.userid) {
        brush.addValue('qHyperCube/qDimensionInfo/0', player.userid);
      } else {
        brush.end();
      }
    };

    this.pic = picasso.chart({
      element: this.container,
      data,
      settings,
    });

    this.resetChart();
  }

  render() {
    const { layout } = this.state;

    if (layout && this.container && !this.pic) {
      // we need to have the `this.container` reference available when rendering:
      setTimeout(() => this.renderPicasso());
    }
    if (this.resetChart) {
      this.resetChart();
    }
    return (
      <div className="card full-width">
        <h2>Most kcal spent</h2>
        <div className="calory-chart" ref={(elem) => { this.container = elem; }}>Loading...</div>
      </div>
    );
  }
}
