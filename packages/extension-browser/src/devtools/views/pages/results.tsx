import * as React from 'react';
import { useState } from 'react';

import { Results as ResultsData, Config } from '../../../shared/types';

import PoweredBy from '../powered-by';
import Page from '../page';
import CategoryResults from './results/category';
import CategorySummary from './results/category-summary';
import ResultsHeader from './results/header';

import * as styles from './results.css';

type Props = {
    disabled?: boolean;

    /** Listener for when the user decides to configure a new scan. */
    onConfigure: () => void;

    /** Listener for when the user decides to run another scan. */
    onRestart: () => void;

    /** A grouped set of the reported problems to render from a scan. */
    results: ResultsData;

    /** Configuration used for the analysis. */
    config: Config;
};

/**
 * Display problems reported by a scan.
 */
const ResultsPage = ({ config, disabled, onConfigure, onRestart, results }: Props) => {
    const [showPassed, setShowPassed] = useState(true);

    const shownCategories = results.categories.filter((category) => {
        return showPassed || category.hints.length > category.passed;
    });

    return (
        <Page className={styles.root} disabled={disabled} onAction={onRestart}>
            <ResultsHeader showPassed={showPassed} url={results.url} onConfigureClick={onConfigure} setShowPassed={setShowPassed} config={config} />
            <div className={styles.results}>
                <nav className={styles.nav}>
                    <ul className={styles.summary}>
                        {results.categories.map((category) => {
                            return (
                                <li key={category.name}>
                                    <CategorySummary {...category} />
                                </li>
                            );
                        })}
                    </ul>
                </nav>
                <div>
                    <main>
                        {shownCategories.map((category) => {
                            return <CategoryResults key={category.name} showPassed={showPassed} {...category} />;
                        })}
                    </main>
                    <footer>
                        <PoweredBy className={styles.poweredBy} />
                    </footer>
                </div>
            </div>
        </Page>
    );
};

export default ResultsPage;
