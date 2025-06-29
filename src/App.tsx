import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { useAtomValue } from 'jotai';
import { viewAtom } from './features/store/atoms';
import { RepositoryList } from './features/repository/RepositoryList';
import { FileList } from './features/file/FileList';
import { HistoryList } from './features/history/HistoryList';
import { AuthScreen } from './features/auth/AuthScreen';
import { useAuth } from './features/auth/useAuth';

export const App: React.FC = () => {
  const view = useAtomValue(viewAtom);
  const { isAuthenticated, isInitializing, handleAuthSuccess } = useAuth();
  const [authError, setAuthError] = useState<string>('');

  const handleAuthError = (error: string) => {
    setAuthError(error);
  };

  useInput((input, key) => {
    if (key.escape && (view === 'repositories' || view === 'history')) {
      process.exit(0);
    }
  });

  if (isInitializing) {
    return (
      <Box flexDirection="column" padding={1}>
        <Text>Loading...</Text>
      </Box>
    );
  }

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
      <Box
        marginBottom={1}
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
      >
        <Text bold color="cyan">
          GitHub File Fetcher TUI
        </Text>
        <Box flexDirection="row">
          <Text color={view === 'history' ? 'cyan' : 'gray'}>📋 History</Text>
          <Text dimColor> | </Text>
          <Text
            color={
              view === 'repositories' || view === 'files' ? 'cyan' : 'gray'
            }
          >
            📁 Browse
          </Text>
        </Box>
      </Box>
      <Box borderStyle="single" flexDirection="column" padding={1}>
        {view === 'history' && <HistoryList />}
        {view === 'repositories' && <RepositoryList />}
        {view === 'files' && <FileList />}
      </Box>
      <Box marginTop={1}>
        <Text dimColor>
          [↑/↓] Navigate [Enter] {view === 'files' ? 'Download' : 'Select'}{' '}
          {view !== 'files' ? '[Tab] Switch' : ''} [Esc]{' '}
          {view === 'files' ? 'Back' : 'Exit'}
        </Text>
      </Box>
    </Box>
  );
};
