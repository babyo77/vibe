import { useCallback, useEffect, useRef } from "react";

type debounceCallback = (...args: any[]) => void;
function useDebounce(callback: debounceCallback, delay: number = 500) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const debouncedFunction = useCallback(
    (...args: any[]) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  return debouncedFunction;
}

export default useDebounce;
