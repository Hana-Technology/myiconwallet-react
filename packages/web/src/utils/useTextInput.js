import { useState } from 'react';

export function useTextInput(initialValue) {
  const [value, setValue] = useState(initialValue);

  function onChange(event) {
    setValue(event.currentTarget.value);
  }

  function resetValue() {
    setValue(initialValue);
  }

  return { value, onChange, resetValue };
}
