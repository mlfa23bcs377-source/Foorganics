import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/** Re-runs the callback when navigating back to an admin route (skips the initial mount load). */
export function useRefreshOnNavigate(path: string, refresh: () => void | Promise<void>) {
  const location = useLocation();
  const refreshRef = useRef(refresh);
  const hasMountedRef = useRef(false);

  refreshRef.current = refresh;

  useEffect(() => {
    if (location.pathname !== path) return;

    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }

    void refreshRef.current();
  }, [location.pathname, path]);
}
