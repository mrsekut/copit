import React from 'react';
import { Box, Text, useInput } from 'ink';
import { useAtom } from 'jotai';
import { viewAtom, selectedFileAtom } from '../store/atoms';
import { RepositoryList } from './RepositoryList';
import { FileList } from './FileList';

export const App: React.FC = () => {
  const [view] = useAtom(viewAtom);
  const [selectedFile] = useAtom(selectedFileAtom);

  useInput((input, key) => {
    if (key.escape && view === 'repositories') {
      process.exit(0);
    }
  });

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
