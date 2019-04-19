import * as React from 'react';

import { Severity } from 'hint/dist/src/lib/types/problems';

import { CategoryResults, HintResults } from '../../../../shared/types';
import { getMessage } from '../../../utils/i18n';

import * as styles from './category-summary.css';

const hasError = (hints: HintResults[]) => {
    return hints.some((hint) => {
        return hint.problems.some((problem) => {
            return problem.severity === Severity.error;
        });
    });
};

const CategorySummary = ({ name, hints, passed }: CategoryResults) => {
    let statusStyle = '';

    if (passed < hints.length) {
        statusStyle = hasError(hints) ? styles.error : styles.warn;
    }

    return (
        <a className={styles.root} href={`#results-category-${name}`}>
            {getMessage(name)}
            <span className={`${styles.status} ${statusStyle}`}>{passed}/{hints.length}</span>
        </a>
    );
};

export default CategorySummary;
