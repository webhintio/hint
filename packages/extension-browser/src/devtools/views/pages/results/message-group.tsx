import * as React from 'react';

import { Problem as ProblemData, Severity } from '@hint/utils-types';

import { getMessage, MessageName } from '../../../utils/i18n';

import Summary from '../../controls/summary';

import Problem from './problem';

import * as styles from './message-group.css';

type Props = {
    message: string;
    problems: ProblemData[];
    severity: Severity;
};

const MessageGroup = ({ message, problems, severity }: Props) => {
    const severityString = Severity[severity];
    const statusStyle = styles[severityString as keyof typeof styles];

    return (
        <details className={styles.root} open>
            <Summary className={styles.header}>
                <span className={`${styles.status} ${statusStyle}`}>{getMessage(`${severityString}Label` as MessageName)}</span>{message}
            </Summary>
            <div className={styles.problems}>
                {problems.map(
                    (problem, index) => {
                        return <Problem key={index} problem={problem} />;
                    }
                )}
            </div>
        </details>
    );
};

export default MessageGroup;
