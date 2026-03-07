import React from 'react';
import { Box, Text, useInput } from 'ink';
import { useAtomValue } from 'jotai';
import { View, viewAtom } from './features/store/atoms.js';
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
      <HelpBar items={helpItems(view)} />
    </Box>
  );
};

const helpItems = (view: View) => {
  switch (view) {
    case 'templates':
      return [
        { key: '↑/↓', label: 'navigate' },
        { key: 'Enter', label: 'copy' },
        { key: 'Tab', label: 'switch' },
        { key: 'c', label: 'clipboard' },
        { key: 'd', label: 'delete' },
        { key: 'Esc', label: 'exit' },
      ];
    case 'register':
      return [
        { key: '↑/↓', label: 'navigate' },
        { key: '←/→', label: 'dir' },
        { key: 'Enter', label: 'select' },
        { key: 'Tab', label: 'switch' },
      ];
  }
};

type HelpItem = {
  key: string;
  label: string;
};

type HelpBarProps = {
  items: HelpItem[];
};

const HelpBar: React.FC<HelpBarProps> = ({ items }) => {
  return (
    <Box marginTop={1}>
      {items.map((item, index) => (
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
