import * as React from 'react';

import { CategoryResults } from '../../../../shared/types';

import { getMessage } from '../../../utils/i18n';

import Hint from './hint';

import * as styles from './category.css';

const Category = ({ name, hints, passed }: CategoryResults) => {
    return (
        <details className={styles.root} open={true}>
            <summary className={styles.summary}>
                <span className={styles.name}>
                    {getMessage(name)}
                </span>
                <span className={styles.status}>
                    {getMessage('passedLabel', [passed.toString(), hints.length.toString()])}
                </span>
            </summary>
            <div className={styles.results}>
                {hints.map((hint) => {
                    return <Hint key={hint.id} {...hint} />;
                })}
            </div>
        </details>
    );
};

export default Category;
