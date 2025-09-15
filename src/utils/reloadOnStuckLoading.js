// utils/reloadOnStuckLoading.js
import { useEffect, useRef } from 'react';

const RELOAD_TIMEOUT_MS = 3000; // 3 seconds

export function useReloadOnStuckLoading(isLoading) {
  const timeoutIdRef = useRef(null);

  useEffect(() => {
    if (isLoading) {
      timeoutIdRef.current = setTimeout(() => {
        console.warn('Page stuck in loading state. Reloading...');
        window.location.reload();
      }, RELOAD_TIMEOUT_MS);
    } else {
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
        timeoutIdRef.current = null;
      }
    }

    return () => {
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
        timeoutIdRef.current = null;
      }
    };
  }, [isLoading]);
}