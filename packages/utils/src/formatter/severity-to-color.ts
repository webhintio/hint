import { Severity } from '@hint/utils-types';
import * as chalk from 'chalk';

export const severityToColor = (severity: Severity): import('chalk').Chalk => {
    switch (severity) {
        case Severity.error:
            return chalk.red;
        case Severity.warning:
            return chalk.yellow;
        case Severity.hint:
            return chalk.hex('9451A0');
        case Severity.information:
            return chalk.gray;
        /* istanbul ignore next */
        default:
            return chalk.yellow;
    }
};
