#!/usr/bin/env node
import React from 'react';
import { render } from 'ink';
import { App } from './features/ui/App';

const app = render(<App />);

process.on('SIGINT', () => {
  app.unmount();
  process.exit(0);
});