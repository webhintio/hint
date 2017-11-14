/**
 * @fileoverview Exports all the actions the CLI is capable of doing.
 */
import { CLIOptions } from '../types'; // eslint-disable-line no-unused-vars
import { newRule } from './rules/new-core-rule';
import { newExternalRule } from './rules/new-external-rule';
import { deleteRule } from './rules/delete-core-rule';
import { initSonarwhalrc } from './init';
import { printHelp } from './help';
import { printVersion } from './version';
import { analyze } from './analyze';

/** All the action handlers for the CLI. */
export const cliActions: Array<(action: CLIOptions) => Promise<boolean> > = [newRule, newExternalRule, deleteRule, initSonarwhalrc, printVersion, analyze, printHelp];
