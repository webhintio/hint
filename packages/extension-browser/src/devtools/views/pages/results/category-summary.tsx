import * as React from 'react';

import { getCategoryName } from '@hint/utils/dist/src/i18n/get-category-name';
import { Severity } from '@hint/utils/dist/src/types/problems';

import { CategoryResults, HintResults } from '../../../../shared/types';

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
        <a className={styles.root} href={`#results-category-${name}`} data-icon={name}>
            {getCategoryName(name)}
            <span className={`${styles.status} ${statusStyle}`}>{hints.length - passed}</span>
        </a>
    );
};

export default CategorySummary;
