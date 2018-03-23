/**
 * @fileoverview Exports all the actions the CLI is capable of doing.
 */
import { CLIOptions } from '../types'; // eslint-disable-line no-unused-vars
import { newRule } from './wizards/new-rule';
import { initSonarwhalrc } from './wizards/init';
import { printHelp } from './help';
import { printVersion } from './version';
import { analyze } from './analyze';
import { newParser } from './wizards/new-parser';

/** All the action handlers for the CLI. */
export const cliActions: Array<(action: CLIOptions) => Promise<boolean> > = [newRule, newParser, initSonarwhalrc, printVersion, analyze, printHelp];
