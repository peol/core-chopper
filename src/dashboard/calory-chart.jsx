import React, { useRef, useEffect } from 'react';
import picassoQ from 'picasso-plugin-q';
import picasso from 'picasso.js';

import useModel from '../hooks/model';
import useLayout from '../hooks/layout';
import usePicasso from '../hooks/picasso';

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
        _mode: 'tilted',
        tiltAngle: 35,
        margin: 10,
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
        maxWidthPx: 100,
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

export default function ({ player }) {
  const layout = useLayout(useModel(genericProps));
  const elementRef = useRef(null);
  const pic = usePicasso(elementRef.current, settings, layout);

  useEffect(() => {
    if (!pic) return;
    const brush = pic.brush('highlight');
    brush.clear();
    if (player.userid) {
      brush.addValue('qHyperCube/qDimensionInfo/0', player.userid);
    } else {
      brush.end();
    }
  }, [pic, player]);

  return (
    <div className="card full-width">
      <h2>Most kcal spent</h2>
      <div className="calory-chart" ref={elementRef}>Loading...</div>
    </div>
  );
}
