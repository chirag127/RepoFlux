import { useState, useEffect } from 'react';

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
  used: number;
}

export function useRateLimit() {
  const [rateLimit, setRateLimit] = useState<RateLimitInfo | null>(() => {
    const saved = localStorage.getItem('repoflux_ratelimit');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    const handleUpdate = () => {
      const saved = localStorage.getItem('repoflux_ratelimit');
      if (saved) {
        setRateLimit(JSON.parse(saved));
      }
    };

    window.addEventListener('storage', handleUpdate);
    // Custom event for internal updates
    window.addEventListener('repoflux_ratelimit_updated', handleUpdate);

    return () => {
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('repoflux_ratelimit_updated', handleUpdate);
    };
  }, []);

  return rateLimit;
}
