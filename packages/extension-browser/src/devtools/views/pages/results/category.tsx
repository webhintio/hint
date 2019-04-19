import * as React from 'react';

import { CategoryResults } from '../../../../shared/types';

import { getMessage } from '../../../utils/i18n';

import Hint from './hint';

import * as styles from './category.css';

type Props = CategoryResults & {
    showPassed: boolean;
};

const Category = ({ name, hints, showPassed }: Props) => {
    const shownHints = hints.filter((hint) => {
        return showPassed || hint.problems.length > 0;
    });

    return (
        <div className={styles.root}>
            <div id={`results-category-${name}`} className={styles.summary}>
                <span className={styles.name}>
                    {getMessage(name)}
                </span>
            </div>
            <div className={styles.results}>
                {shownHints.map((hint) => {
                    return <Hint key={hint.id} {...hint} />;
                })}
            </div>
        </div>
    );
};

export default Category;
