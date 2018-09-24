import React from 'react';
import picassoQ from 'picasso-plugin-q';
import picasso from 'picasso.js';

import EnigmaModel from '../enigma/model';

import './power-chart.css';

picasso.use(picassoQ);

const genericProps = {
  qInfo: {
    qType: 'scores',
  },
  qHyperCubeDef: {
    qDimensions: [
      { qDef: { qFieldDefs: ['=ROUND([duration]/1000/5)'] } },
      { qDef: { qFieldDefs: ['=[name]&\'::\'&[gameid]'] } },
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

function debounce(fn) {
  let timer;
  return function debouncefn(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), 10);
  };
}

picasso.formatter('secs', () => v => duration(v * 5));

const settings = {
  scales: {
    x: {
      data: {
        field: 'qDimensionInfo/0',
      },
      type: 'linear',
      invert: false,
      _padding: 0.2,
      expand: 0.05,
      /* ticks: {
        count: 100,
      }, */
    },
    y: {
      data: {
        fields: ['qMeasureInfo/0'],
      },
      expand: 0.05,
      invert: true,
    },
    color: {
      type: 'color',
      data: { extract: { field: 'qDimensionInfo/1', value: v => v.qText.split('::')[0] } },
      range: ['#a6cee3', '#1f78b4', '#b2df8a', '#33a02c', '#fb9a99', '#e31a1c', '#fdbf6f', '#ff7f00', '#cab2d6', '#6a3d9a', '#ffff99', '#b15928'].concat(['#8dd3c7', '#ffffb3', '#bebada', '#fb8072', '#80b1d3', '#fdb462', '#b3de69', '#fccde5', '#d9d9d9', '#bc80bd']),
    },
  },
  components: [{
    type: 'axis',
    scale: 'y',
    settings: {
      tight: true,
      labels: {
        fontFamily: 'VT323',
        fill: '#fff',
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
        fill: '#fff',
        fontSize: '18px',
        mode: 'tilted',
        tiltAngle: 35,
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
          minor: { field: 'qMeasureInfo/0' },
        },
      },
    },
    settings: {
      layers: {
        curve: 'monotone',
        line: {
          strokeWidth: 5,
          stroke: {
            scale: 'color',
            ref: 'name',
          },
        },
      },
      coordinates: {
        minor: { scale: 'y' },
        major: { scale: 'x' },
        layerId: { ref: 'run' },
      },
    },
  }, {
    type: 'legend-cat',
    scale: 'color',
    dock: 'right',
    settings: {
      layout: { size: 25 },
      title: { show: false },
      item: {
        shape: { size: 14 },
        label: {
          fontFamily: 'VT323',
          fill: '#fff',
          fontSize: '20px',
          text: t => t.datum.label.split('::')[0],
        },
      },
    },
  }, {
    type: 'point',
    key: 'points',
    data: {
      extract: {
        field: 'qDimensionInfo/1',
        // value: v => v.qElemNumber,
        props: {
          major: { field: 'qDimensionInfo/0', value: v => v.qNum },
          minor: { field: 'qMeasureInfo/0' },
        },
      },
    },
    settings: {
      x: { ref: 'major', scale: 'x' },
      y: { ref: 'minor', scale: 'y' },
      size: 0.25,
      fill: '#fff',
      stroke: 'rgba(50, 50, 50, 0.8)',
      strokeWidth: 4,
      opacity: 0,
    },
    brush: {
      consume: [{
        context: 'highlight',
        style: {
          active: {
            opacity: 1,
          },
        },
      }],
    },
  }],
  interactions: [{
    type: 'native',
    events: {
      mousemove: debounce(function mm(e) {
        const bounds = this.chart.element.getBoundingClientRect();
        // todo - calculate distance between two points, use that as width
        const width = 20;
        const p = {
          x: e.clientX - bounds.left - width / 2,
          y: 0,
          width,
          height: bounds.height,
        };
        // console.log(p);
        const shapes = this.chart.shapesAt(p, {
          components: [
            { key: 'points' },
          ],
          propagation: 'stop',
        });
        this.chart.brushFromShapes(shapes, {
          components: [{
            key: 'points',
            contexts: ['highlight'],
            data: ['major'],
            action: 'set',
          }],
        });
      }),
      mouseleave() {
        // this.chart.component('tool').emit('hide');
        this.chart.brush('highlight').clear();
      },
    },
  }],
};

export default class PowerChart extends EnigmaModel {
  constructor() {
    super({ genericProps });
  }

  async renderPicasso() {
    const { layout, model } = this.state;
    this.setState({ initialized: true });
    // const field = await this.getField('name');
    // await field.selectValues([{ qText: 'Andrée' }, { qText: 'Johan B' }]);
    if (!layout.qHyperCube.qDataPages[0].qMatrix.length) {
      this.setState({ empty: true });
      return;
    }
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

    picasso.chart({
      element: this.container,
      data,
      settings,
    });

    this.setState({ empty: false });
  }

  render() {
    const { layout, initialized, empty } = this.state;

    let view = (<div className="power-chart" ref={(elem) => { this.container = elem; }}>Loading...</div>);

    if (empty) {
      view = (<p>No data to visualize.</p>);
    } else if (layout && !initialized) {
      // we need to have the `this.container` reference available when rendering:
      setTimeout(() => this.renderPicasso());
    }
    return (
      <div className="power-wrapper">
        <h2>Power over time</h2>
        {view}
      </div>
    );
  }
}
