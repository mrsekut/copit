import React, { useEffect, useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { useAtom } from 'jotai';
import { viewAtom, selectedFileAtom, isAuthenticatedAtom, usernameAtom, authTokenAtom } from '../store/atoms';
import { RepositoryList } from '../repository/RepositoryList';
import { FileList } from '../file/FileList';
import { AuthScreen } from '../auth/AuthScreen';
import { getStoredAuth } from '../auth/github-auth';

export const App: React.FC = () => {
  const [view] = useAtom(viewAtom);
  const [selectedFile] = useAtom(selectedFileAtom);
  const [isAuthenticated, setIsAuthenticated] = useAtom(isAuthenticatedAtom);
  const [, setUsername] = useAtom(usernameAtom);
  const [, setAuthToken] = useAtom(authTokenAtom);
  const [authError, setAuthError] = useState<string>('');

  useEffect(() => {
    const checkAuth = async () => {
      const authResult = await getStoredAuth();
      if (authResult) {
        setIsAuthenticated(true);
        setUsername(authResult.username);
        setAuthToken(authResult.token);
      }
    };

    checkAuth();
  }, [setIsAuthenticated, setUsername, setAuthToken]);

  const handleAuthSuccess = (token: string, username: string) => {
    setIsAuthenticated(true);
    setUsername(username);
    setAuthToken(token);
  };

  const handleAuthError = (error: string) => {
    setAuthError(error);
  };

  useInput((input, key) => {
    if (key.escape && view === 'repositories') {
      process.exit(0);
    }
  });

  if (!isAuthenticated) {
    return (
      <Box flexDirection="column" padding={1}>
        <AuthScreen onSuccess={handleAuthSuccess} onError={handleAuthError} />
        {authError && (
          <Box marginTop={1}>
            <Text color="red">Error: {authError}</Text>
          </Box>
        )}
      </Box>
    );
  }

  return (
    <Box flexDirection="column" padding={1}>
      <Box marginBottom={1}>
        <Text bold color="cyan">
          GitHub File Fetcher TUI
        </Text>
      </Box>
      <Box borderStyle="single" flexDirection="column" padding={1}>
        {view === 'repositories' && <RepositoryList />}
        {view === 'files' && <FileList />}
      </Box>
      <Box marginTop={1}>
        <Text dimColor>
          [↑/↓] Navigate [Enter] Select [Esc]{' '}
          {view === 'repositories' ? 'Exit' : 'Back'}
        </Text>
      </Box>
      {selectedFile && (
        <Box marginTop={1}>
          <Text color="green">Selected: {selectedFile.path}</Text>
          <Text dimColor>Press Enter to download</Text>
        </Box>
      )}
    </Box>
  );
};
