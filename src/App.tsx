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
          copit
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
      <HelpBar
        items={[
          { key: '↑/↓', label: 'navigate' },
          { key: 'Enter', label: view === 'register' ? 'select' : 'copy' },
          { key: 'Tab', label: 'switch' },
          { key: 'd', label: 'delete', show: view === 'templates' },
          { key: 'Esc', label: 'exit', show: view === 'templates' },
        ]}
      />
    </Box>
  );
};

type HelpItem = {
  key: string;
  label: string;
  show?: boolean;
};

type HelpBarProps = {
  items: HelpItem[];
};

const HelpBar: React.FC<HelpBarProps> = ({ items }) => {
  const visibleItems = items.filter(item => item.show !== false);

  return (
    <Box marginTop={1}>
      {visibleItems.map((item, index) => (
        <React.Fragment key={item.key}>
          {index > 0 && <Text dimColor> • </Text>}
          <Text>
            <Text color="cyan">{item.key}</Text>
            <Text dimColor> {item.label}</Text>
          </Text>
        </React.Fragment>
      ))}
    </Box>
  );
};
