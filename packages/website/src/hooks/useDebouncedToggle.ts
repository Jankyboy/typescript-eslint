import { useCallback, useRef, useState } from 'react';

export function useDebouncedToggle<T>(
  value: T,
  timeout = 1000,
): [T, (data: T) => void] {
  const [state, setState] = useState<T>(value);
  const timeoutIdRef = useRef<number>();

  const update = useCallback(
    (data: T) => {
      setState(data);
      const timeoutId = timeoutIdRef.current;
      if (timeoutId) {
        timeoutIdRef.current = undefined;
        window.clearTimeout(timeoutId);
      }
      timeoutIdRef.current = window.setTimeout(() => {
        setState(value);
      }, timeout);
    },
    [timeout, value],
  );

  return [state, update];
}
