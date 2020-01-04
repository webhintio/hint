import * as React from 'react';

import { Problem as ProblemData, Severity } from '@hint/utils-types';

import { HintResults } from '../../../../shared/types';

import { getMessage } from '../../../utils/i18n';

import ExternalLink from '../../controls/external-link';

import Summary from '../../controls/summary';

import MessageGroup from './message-group';

import * as styles from './hint.css';

/**
 * Group problems which have the same message string.
 */
const groupProblems = (problems: ProblemData[], field: 'message' | 'severity') => {
    const groups = new Map<string, ProblemData[]>();

    for (const problem of problems) {
        const problemFieldValue = problem[field].toString();
        const group = groups.get(problemFieldValue) || [];

        group.push(problem);
        groups.set(problemFieldValue, group);
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

const getSummaryMessage = (problems: ProblemData[]): string => {
    if (!problems.length) {
        return getMessage('noIssuesLabel');
    }

    const messages = [];
    const groups = groupProblems(problems, 'severity');
    const errorGroup = groups.get(Severity.error.toString());
    const warningGroup = groups.get(Severity.warning.toString());
    const informationGroup = groups.get(Severity.information.toString());
    const hintGroup = groups.get(Severity.hint.toString());

    if (errorGroup) {
        messages.push(getMessage('errorIssuesLabel', errorGroup.length.toString()));
    }
    if (warningGroup) {
        messages.push(getMessage('warningIssuesLabel', warningGroup.length.toString()));
    }
    if (hintGroup) {
        messages.push(getMessage('hintIssuesLabel', hintGroup.length.toString()));
    }
    if (informationGroup) {
        messages.push(getMessage('informationIssuesLabel', informationGroup.length.toString()));
    }

    return messages.join(', ');
};

const Hint = ({ name, problems, helpURL }: HintResults) => {
    const groups = groupProblems(problems, 'message');
    const summary = getSummaryMessage(problems);

    return (
        <details>
            <Summary>
                <span>
                    {name}:
                </span>
                {' '}
                <span className={`${styles.summary}`}>
                    {summary}
                </span>
            </Summary>
            <div className={styles.results}>
                <ExternalLink href={helpURL}>
                    {!problems.length ? getMessage('learnWhyLabel') : getMessage('learnWhyAndHowLabel')}
                </ExternalLink>
                {getSortedGroupKeys(groups).map(
                    (message) => {
                        return <MessageGroup key={message} message={message} severity={groups.get(message)![0].severity} problems={groups.get(message)!} />;
                    }
                )}
            </div>
        </details>
    );
};

export default Hint;
