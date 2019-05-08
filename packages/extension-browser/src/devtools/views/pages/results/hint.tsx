import * as React from 'react';

import { Problem as ProblemData, Severity } from '@hint/utils/dist/src/types/problems';

import { HintResults } from '../../../../shared/types';

import { getMessage } from '../../../utils/i18n';

import ExternalLink from '../../controls/external-link';

import Problem from './problem';

import * as styles from './hint.css';

const hasError = (problems: ProblemData[]) => {
    return problems.some((problem) => {
        return problem.severity === Severity.error;
    });
};

const Hint = ({ name, problems, helpURL }: HintResults) => {
    let statusStyle = styles.pass;

    if (problems.length) {
        statusStyle = hasError(problems) ? styles.error : styles.warn;
    }

    return (
        <details className={styles.root}>
            <summary className={styles.summary}>
                <span>
                    {name}
                </span>
                {' '}
                <span className={`${styles.status} ${statusStyle}`}>
                    {!problems.length ? getMessage('noIssuesLabel') : getMessage('hintIssuesLabel', problems.length.toString())}
                </span>
            </summary>
            <div className={styles.results}>
                <ExternalLink href={helpURL}>
                    {!problems.length ? getMessage('learnWhyLabel') : getMessage('learnWhyAndHowLabel')}
                </ExternalLink>
                {problems.map(
                    (problem, index) => {
                        return <Problem key={index} problem={problem} index={index} />;
                    })
                }
            </div>
        </details>
    );
};

export default Hint;
