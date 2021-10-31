#!/usr/bin/env node

import { exit, argv } from 'process';
import { mint } from './elven-mint';
import packageJson from '../package.json';

const args = argv;
const command = args ? args[2] : undefined;

// Show version number
if (command === '--version' || command === '-v') {
  console.log(packageJson.version);
  exit();
}

mint();
