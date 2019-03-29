import * as React from 'react';

import { HintResults } from '../../../../shared/types';

import { getMessage } from '../../../utils/i18n';

import Problem from './problem';

import * as styles from './hint.css';

const Hint = ({ name, problems, helpURL }: HintResults) => {
    return (
        <details className={styles.root}>
            <summary className={styles.summary}>
                <span>
                    {name}:
                </span>
                {' '}
                <span className={`${styles.status} ${!problems.length ? styles.passed : ''}`}>
                    {!problems.length ? getMessage('passedStatus') : problems.length.toString()}
                </span>
            </summary>
            <div className={styles.results}>
                <a href={helpURL} target="_blank">
                    {problems.length ? getMessage('learnWhyLabel') : getMessage('learnWhyAndHowLabel')}
                </a>
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
