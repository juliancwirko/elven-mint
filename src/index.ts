#!/usr/bin/env node

import { exit, argv } from 'process';
import { mint } from './elven-mint';
import { initCatchOnExit } from './catch-on-exit';
import packageJson from '../package.json';

const args = argv;
const command = args ? args[2] : undefined;

// Show version number
if (command === '--version' || command === '-v') {
  console.log(packageJson.version);
  exit();
}

mint();

// Make sure that we will know where we were when unexpected exit occurs
initCatchOnExit();
