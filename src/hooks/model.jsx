import { useMemo } from 'react';
import usePromise from 'react-use-promise';
import getDoc from '../session';

export default function useModel(def) {
  const [app, appError] = usePromise(useMemo(() => getDoc(), []));
  if (appError) throw appError;
  const [model, modelError] = usePromise(
    useMemo(() => (app ? app.createObject(def) : null), [app && app.id + JSON.stringify(def)]),
  );
  if (modelError) throw modelError;
  return model;
}
