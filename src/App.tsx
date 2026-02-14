import React from 'react';
import { Box, Text, useInput } from 'ink';
import { useAtomValue } from 'jotai';
import { viewAtom } from './features/store/atoms.js';
import { TemplateList } from './features/template/TemplateList.js';
import { RegisterScreen } from './features/template/RegisterScreen.js';

export const App: React.FC = () => {
  const view = useAtomValue(viewAtom);

  useInput((_input, key) => {
    if (key.escape && view === 'templates') {
      process.exit(0);
    }
  });

  return (
    <Box flexDirection="column" padding={1}>
      <Box
        marginBottom={1}
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
      >
        <Text bold color="cyan">
          copit - Template Manager
        </Text>
        <Box flexDirection="row">
          <Text color={view === 'templates' ? 'cyan' : 'gray'}>
            📋 Templates
          </Text>
          <Text dimColor> | </Text>
          <Text color={view === 'register' ? 'cyan' : 'gray'}>📌 Register</Text>
        </Box>
      </Box>
      <Box borderStyle="single" flexDirection="column" padding={1}>
        {view === 'templates' && <TemplateList />}
        {view === 'register' && <RegisterScreen />}
      </Box>
      <Box marginTop={1}>
        <Text dimColor>
          [↑/↓] Navigate [Enter] {view === 'register' ? 'Select' : 'Copy'} [Tab]
          Switch{view === 'templates' && ' [d] Delete [Esc] Exit'}
        </Text>
      </Box>
    </Box>
  );
};
