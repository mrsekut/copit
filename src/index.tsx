#!/usr/bin/env node
import React from 'react';
import { render } from 'ink';
import { Provider } from 'jotai';
import { App } from './App';

const app = render(
  <Provider>
    <App />
  </Provider>,
);

process.on('SIGINT', () => {
  app.unmount();
  process.exit(0);
});
