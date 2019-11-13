import { Severity } from '@hint/utils-types';
import chalk from 'chalk';

export const severityToColor = (severity: Severity): import('chalk').Chalk => {
    switch (severity) {
        case Severity.error:
            return chalk.red;
        case Severity.warning:
            return chalk.yellow;
        case Severity.information:
            return chalk.gray;
        case Severity.hint:
            return chalk.hex('9451A0');
        default:
            return chalk.yellow;
    }
};