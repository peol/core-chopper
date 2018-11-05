import { useState, useEffect } from 'react';
import picassoQ from 'picasso-plugin-q';
import picasso from 'picasso.js';

picasso.use(picassoQ);

export default function (element, settings, layout) {
  const [pic, setPicasso] = useState(null);

  // const field = await this.getField('name');
  // await field.selectValues([{ qText: 'Andrée' }, { qText: 'Johan B' }]);

  useEffect(() => {
    if (!element || !layout || pic) return;

    const data = [{
      type: 'q',
      key: 'qHyperCube',
      data: layout.qHyperCube,
    }];

    setPicasso(picasso.chart({
      element,
      data,
      settings,
    }));
  }, [element, settings, layout]);

  return pic;
}
