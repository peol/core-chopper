import React from 'react';
import picassoQ from 'picasso-plugin-q';
import picasso from 'picasso.js';

import EnigmaModel from '../enigma/model';

import './power-chart.css';

picasso.use(picassoQ);

const ROUND_TO_SECONDS = 5;
const TEXT_COLOR = '#333';

const genericProps = {
  qInfo: {
    qType: 'scores',
  },
  qHyperCubeDef: {
    qDimensions: [
      { qDef: { qFieldDefs: [`=ROUND([duration]/1000/${ROUND_TO_SECONDS})`] } },
      { qDef: { qFieldDefs: ['=[name]&\'::\'&[gameid]&\'::\'&[userid]'] } },
    ],
    qMeasures: [
      { qDef: { qDef: 'Avg([power])' } },
    ],
    qInitialDataFetch: [{
      qWidth: 3,
      qHeight: 0,
    }],
    qInterColumnSortOrder: [0, 1],
  },
};

// from https://gist.github.com/peol/1127900
function duration(secs) {
  let seconds = secs;

  function subtract(div) {
    const v = Math.floor(seconds / div);
    seconds %= div;
    return v;
  }

  let val = [
    [subtract(31536000), 'y'],
    [subtract(2628000), 'mos'],
    [subtract(604800), 'w'],
    [subtract(86400), 'd'],
    [subtract(3600), 'h'],
    [subtract(60), 'm'],
    [seconds, 's'],
  ];

  val = val.filter(i => i[0] > 0 || i[1].substring(0) === 's').map(v => v.join(''));
  return val.join('');
}

picasso.formatter('secs', () => v => duration(v * ROUND_TO_SECONDS));

const settings = {
  scales: {
    x: {
      data: {
        field: 'qDimensionInfo/0',
      },
      type: 'linear',
      invert: false,
      _padding: 0.2,
    },
    y: {
      data: {
        fields: ['qMeasureInfo/0'],
      },
      _expand: 0.05,
      invert: true,
    },
    color: {
      type: 'color',
      data: { extract: { field: 'qDimensionInfo/1', value: v => v.qText.split('::')[2] } },
      range: ['#2a4858', '#ff3900', '#ff6600', '#f01d2d', '#ff0b00', '#e93a06', '#bb99aa', '#da0a2f', '#cf6181', '#7717a9', '#283d6a', '#24247d', '#de405d', '#f79f02', '#ff9300', '#c47e9a', '#cc0d7e', '#ffc000', '#441e92', '#be10be'],
    },
  },
  components: [{
    type: 'axis',
    scale: 'y',
    settings: {
      tight: true,
      labels: {
        fontFamily: 'VT323',
        fill: TEXT_COLOR,
        fontSize: '18px',
      },
    },
  }, {
    type: 'axis',
    scale: 'x',
    dock: 'bottom',
    formatter: { type: 'secs' },
    settings: {
      labels: {
        fontFamily: 'VT323',
        fill: TEXT_COLOR,
        fontSize: '18px',
        mode: 'tilted',
        tiltAngle: 35,
      },
      line: {
        show: false,
      },
    },
  }, {
    type: 'grid-line',
    x: { scale: 'x' },
    y: { scale: 'y' },
  }, {
    type: 'line',
    data: {
      extract: {
        field: 'qDimensionInfo/0',
        value: v => v.qNum,
        props: {
          run: { field: 'qDimensionInfo/1' },
          name: { field: 'qDimensionInfo/1', value: v => v.qText.split('::')[0] },
          id: { field: 'qDimensionInfo/1', value: v => v.qText.split('::')[2] },
          minor: { field: 'qMeasureInfo/0' },
        },
      },
    },
    settings: {
      layers: {
        curve: 'monotone',
        line: {
          strokeWidth: 2,
          stroke: {
            scale: 'color',
            ref: 'id',
          },
        },
      },
      coordinates: {
        minor: { scale: 'y' },
        major: { scale: 'x' },
        layerId: { ref: 'run' },
      },
    },
    brush: {
      consume: [{
        context: 'highlight',
        style: {
          active: {
            strokeWidth: 5,
            opacity: 1,
          },
          inactive: {
            opacity: 0.5,
            strokeDasharray: '1',
          },
        },
      }],
    },
  }, {
    type: 'legend-cat',
    scale: 'color',
    dock: 'right',
    settings: {
      layout: { size: 50 },
      title: { show: false },
      item: {
        shape: { size: 10 },
        label: {
          maxWidth: 100,
          fontFamily: 'VT323',
          fill: TEXT_COLOR,
          fontSize: '16px',
          text: t => t.datum.label.split('::')[0],
        },
      },
    },
    brush: {
      consume: [{
        context: 'highlight',
        style: {
          active: {
            opacity: 1,
          },
          inactive: {
            opacity: 0.5,
          },
        },
      }],
    },
  }],
};

export default class PowerChart extends EnigmaModel {
  constructor({ player }) {
    super({ genericProps });
    this.state = { player };
  }

  componentWillReceiveProps({ player }) {
    this.setState({ player });
  }

  async renderPicasso() {
    const { layout, model } = this.state;
    // const field = await this.getField('name');
    // await field.selectValues([{ qText: 'Andrée' }, { qText: 'Johan B' }]);
    const contData = await model.getHyperCubeContinuousData(
      '/qHyperCubeDef',
      {
        qStart: 0,
        qEnd: layout.qHyperCube.qDimensionInfo[0].qMax,
        qNbrPoints: 32,
        qMaxNbrTicks: 300,
      },
    );
    layout.qHyperCube.qDataPages = contData.qDataPages;
    Object.assign(layout.qHyperCube.qDataPages[0].qArea, {
      qWidth: 3,
      qHeight: 1200000,
    });

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
        brush.addValue('qHyperCube/qDimensionInfo/1', player.userid);
      } else {
        brush.end();
      }
    };

    this.pic = picasso.chart({
      element: this.container,
      data,
      settings: Object.assign({}, settings, {
        interactions: [{
          type: 'native',
          events: {
            mousemove(e) {
              const b = this.chart.element.getBoundingClientRect();
              const p = {
                x: e.clientX - b.left,
                y: e.clientY - b.top,
              };
              const brush = this.chart.brush('highlight');
              const shapes = this.chart.shapesAt(p);
              if (shapes.length) {
                brush.clear();
                const values = shapes.map(s => s.data.label.split('::')[2]);
                brush.addValue('qHyperCube/qDimensionInfo/1', values[0]);
              }
            },
            mouseleave: () => this.resetChart(),
          },
        }],
      }),
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
        <h2>Power over time</h2>
        <div className="power-chart" ref={(elem) => { this.container = elem; }}>Loading...</div>
      </div>
    );
  }
}
