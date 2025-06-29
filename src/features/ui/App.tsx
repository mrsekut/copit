import React from 'react';
import { Box, Text } from 'ink';
import { useAppStore } from '../store/app';
import { RepositoryList } from './RepositoryList';

export const App: React.FC = () => {
  const { view } = useAppStore();

  return (
    <Box flexDirection="column" padding={1}>
      <Box marginBottom={1}>
        <Text bold color="cyan">
          GitHub File Fetcher TUI
        </Text>
      </Box>
      <Box borderStyle="single" flexDirection="column" padding={1}>
        {view === 'repositories' && <RepositoryList />}
        {view === 'files' && <Text>File list will be here</Text>}
      </Box>
      <Box marginTop={1}>
        <Text dimColor>
          [↑/↓] Navigate [Enter] Select [Esc] Exit
        </Text>
      </Box>
    </Box>
  );
};