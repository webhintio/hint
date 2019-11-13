import { Chalk } from 'chalk';
import { severityToColor } from './severity-to-color';
import { Severity } from '@hint/utils-types';

export const occurencesToColor = (ocurrences: { [x: string]: number }): Chalk => {
    if (ocurrences[Severity.error] > 0) {
        return severityToColor(Severity.error);
    } else if (ocurrences[Severity.warning] > 0) {
        return severityToColor(Severity.warning);
    } else if (ocurrences[Severity.information] > 0) {
        return severityToColor(Severity.information);
    } else if (ocurrences[Severity.hint] > 0) {
        return severityToColor(Severity.hint);
    }

    return severityToColor(Severity.warning);
};