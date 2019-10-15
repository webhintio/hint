import * as React from 'react';

import { Problem as ProblemData } from '@hint/utils/dist/src/types/problems';

import Summary from '../../controls/summary';

import Problem from './problem';

import * as styles from './message-group.css';

type Props = {
    message: string;
    problems: ProblemData[];
};

const MessageGroup = ({ message, problems }: Props) => {
    return (
        <details className={styles.root} open>
            <Summary className={styles.header}>
                {message}
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
