import * as React from 'react';

import { Results as ResultsData } from '../../../shared/types';

import { getMessage } from '../../utils/i18n';

import Page from '../page';
import CategoryResults from './results/category';

import * as styles from './results.css';

type Props = {
    /** Listener for when the user decides to run another scan. */
    onRestart: () => void;

    /** A grouped set of the reported problems to render from a scan. */
    results: ResultsData;
};

/**
 * Display problems reported by a scan.
 */
const ResultsPage = ({ onRestart, results }: Props) => {
    return (
        <Page title={getMessage('hintsTitle')} className={styles.root} actionName={getMessage('analyzeAgainButtonLabel')} onAction={onRestart}>
            {results.categories.map((category) => {
                return <CategoryResults key={category.name} {...category} />;
            })}
        </Page>
    );
};

export default ResultsPage;
