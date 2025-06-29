import { useAtom, useSetAtom } from 'jotai';
import { useEffect, useState } from 'react';
import { getStoredAuth } from './github-auth.js';
import { usernameAtom, isAuthenticatedAtom, authTokenAtom } from './atoms.js';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useAtom(isAuthenticatedAtom);
  const setUsername = useSetAtom(usernameAtom);
  const setAuthToken = useSetAtom(authTokenAtom);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const authResult = await getStoredAuth();

      if (authResult) {
        setIsAuthenticated(true);
        setUsername(authResult.username);
        setAuthToken(authResult.token);
      }

      setIsInitializing(false);
    };

    checkAuth();
  }, [setIsAuthenticated, setUsername, setAuthToken]);

  const handleAuthSuccess = (token: string, username: string) => {
    setIsAuthenticated(true);
    setUsername(username);
    setAuthToken(token);
  };

  return {
    isAuthenticated,
    isInitializing,
    handleAuthSuccess,
  };
};
