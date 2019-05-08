import * as React from 'react';
import { useCallback, useState } from 'react';

import { Config as ConfigData, ErrorData, Results as ResultsData } from '../../shared/types';

import Analyze from './pages/analyze';
import ConfigPage from './pages/config';
import ErrorPage from './pages/error';
import ResultsPage from './pages/results';

import { trackCancel, trackError, trackFinish, trackStart } from '../utils/analytics';
import { useCurrentTheme } from '../utils/themes';

import * as styles from './app.css';

const enum Page {
    Config,
    Error,
    Results
}

const emptyResults: ResultsData = { categories: [], url: '' };

const App = () => {
    const [page, setPage] = useState(Page.Config);
    const [error, setError] = useState({} as ErrorData);
    const [config, setConfig] = useState({} as ConfigData);
    const [results, setResults] = useState(emptyResults);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const theme = useCurrentTheme();

    /*
     * Utilize `useCallback` to memoize handlers passed to child components.
     * Allows `shouldComponentUpdate` optimizations to reduce nested re-render.
     *
     * TODO: Pass dispatch from `useReducer` instead.
     *
     * https://reactjs.org/docs/hooks-faq.html#are-hooks-slow-because-of-creating-functions-in-render
     */

    const onCancel = useCallback((duration: number) => {
        setIsAnalyzing(false);
        trackCancel(duration);
    }, []);

    const onConfigure = useCallback(() => {
        setPage(Page.Config);
    }, []);

    const onError = useCallback((error: ErrorData) => {
        setIsAnalyzing(false);
        setPage(Page.Error);
        setError(error);
        trackError(error);
    }, []);

    const onRestart = useCallback(() => {
        setIsAnalyzing(true);
        trackStart();
    }, []);

    const onResults = useCallback((results: ResultsData, duration: number) => {
        setIsAnalyzing(false);
        setPage(Page.Results);
        setResults(results);
        trackFinish(duration);
    }, []);

    const onStart = useCallback((newConfig: ConfigData) => {
        setConfig(newConfig);
        onRestart();
    }, [onRestart]);

    const getCurrentPage = () => {
        switch (page) {
            case Page.Config:
                return <ConfigPage disabled={isAnalyzing} onStart={onStart}/>;
            case Page.Error:
                return <ErrorPage disabled={isAnalyzing} error={error} onConfigure={onConfigure} onRestart={onRestart}/>;
            case Page.Results:
                return <ResultsPage disabled={isAnalyzing} results={results} onConfigure={onConfigure} onRestart={onRestart}/>;
            default:
                throw new Error(`Unknown page: ${page}`);
        }
    };

    return (
        <div className={styles.root} data-theme={theme}>
            {getCurrentPage()}
            {isAnalyzing && <Analyze config={config} onCancel={onCancel} onError={onError} onResults={onResults}/>}
        </div>
    );
};

export default App;
