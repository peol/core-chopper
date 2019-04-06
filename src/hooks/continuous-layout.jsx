import { useAsync } from 'react-use';

export default function useContinuousLayout(model, layout, max = 0) {
  const { value: contData, error: contDataError } = useAsync(async () => {
    if (!model || !layout) return null;
    return model.getHyperCubeContinuousData(
      '/qHyperCubeDef',
      {
        qStart: 0,
        qEnd: max || layout.qHyperCube.qDimensionInfo[0].qMax,
        qNbrPoints: 32,
        qMaxNbrTicks: 300,
      },
    );
  }, [model, layout, max]);
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
