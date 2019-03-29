import * as React from 'react';
import { useCallback, useState } from 'react';

import { Config as ConfigData, Results as ResultsData } from '../../shared/types';

import AnalyzePage from './pages/analyze';
import ConfigPage from './pages/config';
import ResultsPage from './pages/results';

import { trackCancel, trackFinish, trackStart } from '../utils/analytics';
import { sendMessage } from '../utils/messaging';
import { addNetworkListeners, removeNetworkListeners } from '../utils/network';
import { useCurrentTheme } from '../utils/themes';

import * as styles from './app.css';

const enum Page {
    Analyze,
    Config,
    Results
}

const emptyResults: ResultsData = { categories: [] };

const App = () => {
    const [page, setPage] = useState(Page.Config);
    const [results, setResults] = useState(emptyResults);
    const theme = useCurrentTheme();

    /*
     * Utilize `useCallback` to memoize handlers passed to child components.
     * Allows `shouldComponentUpdate` optimizations to reduce nested re-render.
     *
     * https://reactjs.org/docs/hooks-faq.html#are-hooks-slow-because-of-creating-functions-in-render
     */

    const onCancel = useCallback((duration: number) => {
        setPage(Page.Config);
        sendMessage({ done: true }); // Tell the background script to cancel scanning.
        removeNetworkListeners();
        trackCancel(duration);
    }, []);

    const onRestart = useCallback(() => {
        setPage(Page.Config);
    }, []);

    const onResults = useCallback((results: ResultsData, duration: number) => {
        setPage(Page.Results);
        setResults(results);
        trackFinish(duration);
    }, []);

    const onStart = useCallback((config: ConfigData) => {
        setPage(Page.Analyze);
        sendMessage({ enable: { config } }); // Tell the background script to start scanning.
        addNetworkListeners();
        trackStart();
    }, []);

    const getCurrentPage = () => {
        switch (page) {
            case Page.Config:
                return <ConfigPage onStart={onStart}/>;
            case Page.Analyze:
                return <AnalyzePage onCancel={onCancel} onResults={onResults}/>;
            case Page.Results:
                return <ResultsPage results={results} onRestart={onRestart}/>;
            default:
                throw new Error(`Unknown page: ${page}`);
        }
    };

    return (
        <div className={styles.root} data-theme={theme}>
            {getCurrentPage()}
        </div>
    );
};

export default App;
