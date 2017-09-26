/**
 * @fileoverview Exports all the actions the CLI is capable of doing.
 */
import { CLIOptions } from '../types'; // eslint-disable-line no-unused-vars
import { newRule } from './rules/create-core-rule';
import { deleteRule } from './rules/delete-core-rule';
import { initSonarrc } from './init';
import { printHelp } from './help';
import { printVersion } from './version';
import { analyze } from './analyze';

/** All the action handlers for the CLI. */
export const cliActions: Array<(action: CLIOptions) => Promise<boolean> > = [newRule, deleteRule, initSonarrc, printVersion, analyze, printHelp];
