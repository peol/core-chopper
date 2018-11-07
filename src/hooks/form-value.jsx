import { useState } from 'react';

export default function useFormValue(initialValue) {
  const [val, setVal] = useState(initialValue);
  return [val, (data) => {
    if (data && data.target) {
      const valueProp = data.target.type === 'checkbox' ? 'checked' : 'value';
      setVal(data.target[valueProp]);
    } else {
      setVal(data);
    }
  }];
}
