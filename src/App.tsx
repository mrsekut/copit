import React from 'react';
import { Box, Text, useInput } from 'ink';
import { useAtomValue } from 'jotai';
import { viewAtom } from './features/store/atoms.js';

export const App: React.FC = () => {
  const view = useAtomValue(viewAtom);

  useInput((_input, key) => {
    if (key.escape) {
      process.exit(0);
    }
  });

  return (
    <Box flexDirection="column" padding={1}>
      <Box marginBottom={1}>
        <Text bold color="cyan">
          copit - Template Manager
        </Text>
      </Box>
      <Box borderStyle="single" flexDirection="column" padding={1}>
        <Text dimColor>
          {view === 'templates'
            ? 'Templates will be shown here'
            : 'Register screen will be shown here'}
        </Text>
      </Box>
      <Box marginTop={1}>
        <Text dimColor>[Esc] Exit</Text>
      </Box>
    </Box>
  );
};
