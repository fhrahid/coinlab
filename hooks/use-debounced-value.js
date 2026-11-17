import { useEffect, useState } from "react";

// Returns `value` after it has stopped changing for `delay` ms. Use it between
// a text input and expensive work (filtering, requests) so that work runs once
// per pause in typing instead of once per keystroke.
export function useDebouncedValue(value, delay = 250) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}
