import * as React from 'react';

import { Problem as ProblemData, Severity } from '@hint/utils/dist/src/types/problems';

import { HintResults } from '../../../../shared/types';

import { getMessage } from '../../../utils/i18n';

import ExternalLink from '../../controls/external-link';

import Summary from '../../controls/summary';

import MessageGroup from './message-group';

import * as styles from './hint.css';

const hasError = (problems: ProblemData[]) => {
    return problems.some((problem) => {
        return problem.severity === Severity.error;
    });
};

/**
 * Group problems which have the same message string.
 */
const groupProblems = (problems: ProblemData[]) => {
    const groups = new Map<string, ProblemData[]>();

    for (const problem of problems) {
        const group = groups.get(problem.message) || [];

        group.push(problem);
        groups.set(problem.message, group);
    }

    return groups;
};

/**
 * Sort group keys (messages) with higher severity first,
 * then alphabetically by message text.
 */
const getSortedGroupKeys = (groups: Map<string, ProblemData[]>) => {
    return [...groups.keys()].sort((k1, k2) => {
        const p1 = groups.get(k1)![0];
        const p2 = groups.get(k2)![0];

        if (p1.severity > p2.severity) {
            return -1;
        }

        if (p1.severity < p2.severity) {
            return 1;
        }

        return k1.localeCompare(k2);
    });
};

const Hint = ({ name, problems, helpURL }: HintResults) => {
    const groups = groupProblems(problems);
    let statusStyle = styles.pass;

    if (problems.length) {
        statusStyle = hasError(problems) ? styles.error : styles.warn;
    }

    return (
        <details>
            <Summary>
                <span>
                    {name}
                </span>
                {' '}
                <span className={`${styles.status} ${statusStyle}`}>
                    {!problems.length ? getMessage('noIssuesLabel') : getMessage('hintIssuesLabel', groups.size.toString())}
                </span>
            </Summary>
            <div className={styles.results}>
                <ExternalLink href={helpURL}>
                    {!problems.length ? getMessage('learnWhyLabel') : getMessage('learnWhyAndHowLabel')}
                </ExternalLink>
                {getSortedGroupKeys(groups).map(
                    (message) => {
                        return <MessageGroup key={message} message={message} problems={groups.get(message)!} />;
                    }
                )}
            </div>
        </details>
    );
};

export default Hint;
