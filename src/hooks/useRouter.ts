import { useState, useEffect } from 'react';

// Very lightweight hash-based router
// e.g. /#/repos/owner/name/runs/123

export function useRouter() {
  const [hash, setHash] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.location.hash || '#/';
    }
    return '#/';
  });

  useEffect(() => {
    const onHashChange = () => {
      setHash(window.location.hash || '#/');
    };
    
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const navigate = (path: string) => {
    window.location.hash = path.startsWith('#') ? path : `#${path}`;
  };

  // Parsing utilities
  const currentPath = hash.replace(/^#/, '');
  const segments = currentPath.split('/').filter(Boolean);

  // Helper matchers
  const isHome = currentPath === '/' || currentPath === '';
  const isSettings = currentPath === '/settings';
  
  // Format: /repo/:owner/:name
  const isRepoDetail = segments[0] === 'repo' && segments.length >= 3;
  const repoOwner = isRepoDetail ? segments[1] : null;
  const repoName = isRepoDetail ? segments[2] : null;

  return {
    hash,
    path: currentPath,
    segments,
    navigate,
    matches: {
      isHome,
      isSettings,
      isRepoDetail,
      repoOwner,
      repoName
    }
  };
}
