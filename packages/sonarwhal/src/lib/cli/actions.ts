/**
 * @fileoverview Exports all the actions the CLI is capable of doing.
 */
import { CLIOptions } from '../types';

/** Wrapper to dynamically load the different CLI tasks depending on a condition */
const action = (pkg: string, condition?: string): (actions: CLIOptions) => Promise<boolean> => {
    return async (options: CLIOptions): Promise<boolean> => {
        if (!condition || options[condition]) {
            const { default: task } = await import(pkg);

            return await task(options);
        }

        return false;
    };
};

/** All the action handlers for the CLI. */
export const cliActions: Array<(action: CLIOptions) => Promise<boolean>> =
    [
        action('./wizards/new-rule', 'newRule'),
        action('./wizards/new-parser', 'newParser'),
        action('./wizards/init', 'init'),
        action('./version', 'version'),
        action('./analyze', '_'),
        action('./help')
    ];
