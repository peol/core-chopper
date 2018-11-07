import { useMemo } from 'react';
import usePromise from 'react-use-promise';

export default function useContinuousLayout(model, layout) {
  const [contData, contDataError] = usePromise(
    useMemo(() => (model && layout
      ? model.getHyperCubeContinuousData(
        '/qHyperCubeDef',
        {
          qStart: 0,
          qEnd: layout.qHyperCube.qDimensionInfo[0].qMax,
          qNbrPoints: 32,
          qMaxNbrTicks: 300,
        },
      )
      : null),
    [model, layout]),
  );
  if (!model || !layout) return null;
  if (contDataError) {
    console.warn('Continuous layout failed to fetch:', contDataError);
    return layout;
  }
  if (contData) {
    Object.assign(layout.qHyperCube.qDataPages, contData.qDataPages);
    Object.assign(layout.qHyperCube.qDataPages[0].qArea, {
      qWidth: 3,
      qHeight: 1200000,
    });
    return layout;
  }
  return null;
}
