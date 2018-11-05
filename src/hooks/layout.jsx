import { useState, useEffect } from 'react';

export default function useLayout(model) {
  const [layout, setLayout] = useState();

  useEffect(() => {
    if (!model) return null;

    let cancelled = false;

    const modelChanged = async () => {
      const newLayout = model.getAppLayout
        ? await model.getAppLayout()
        : await model.getLayout();
      if (!cancelled) {
        setLayout(newLayout);
      }
    };

    model.on('changed', modelChanged);
    modelChanged();

    return () => {
      cancelled = true;
      model.removeListener('changed', modelChanged);
    };
  }, [model && model.id]);

  return layout;
}
