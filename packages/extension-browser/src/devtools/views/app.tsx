import * as React from 'react';
import { useCallback, useState } from 'react';

import { Config as ConfigData, ErrorData, Results as ResultsData } from '../../shared/types';

import Analyze from './pages/analyze';
import Banner from './controls/banner';
import Button from './controls/button';
import ConfigPage from './pages/config';
import ErrorPage from './pages/error';
import ExternalLink from './controls/external-link';
import ResultsPage from './pages/results';

import { trackCancel, trackError, trackFinish, trackStart, trackTimeout, showOptIn, enable as enableTelemetry, disable as disableTelemetry } from '../utils/analytics';
import { useCurrentDesignStyles, useCurrentTheme, withCurrentDesign } from '../utils/themes';
import { getMessage } from '../utils/i18n';

import * as fluent from './app.fluent.css';
import * as photon from './app.photon.css';

export const enum Page {
    Config,
    Error,
    Results
}

const emptyResults: ResultsData = { categories: [], url: '' };

export type Props = {
    config?: ConfigData;
    error?: ErrorData;
    isAnalyzing?: boolean;
    page?: Page;
    results?: ResultsData;
};

const App = (props: Props) => {
    const [page, setPage] = useState(props.page || Page.Config);
    const [error, setError] = useState(props.error || {} as ErrorData);
    const [config, setConfig] = useState(props.config || {} as ConfigData);
    const [results, setResults] = useState(props.results || emptyResults);
    const [isAnalyzing, setIsAnalyzing] = useState(props.isAnalyzing || false);
    const [show, setShow] = useState(showOptIn());

    const styles = useCurrentDesignStyles({ fluent, photon });
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
        trackFinish(config, results, duration);
    }, [config]);

    const onStart = useCallback((newConfig: ConfigData) => {
        setConfig(newConfig);
        onRestart();
    }, [onRestart]);

    const onTimeout = useCallback((duration: number) => {
        setIsAnalyzing(false);
        setPage(Page.Error);
        setError({ message: 'Scan timed out.', stack: '' });
        trackTimeout(duration);
    }, []);

    const onEnableTelementry = useCallback(() => {
        setShow(false);
        enableTelemetry();
    }, []);

    const onDisableTelemetry = useCallback(() => {
        setShow(false);
        disableTelemetry();
    }, []);

    const getBannerContent = () => {
        return (<>
            <span className={styles.message}>
                {getMessage('helpUs')}
                &nbsp;<ExternalLink href="https://webhint.io/docs/user-guide/telemetry/summary/">{getMessage('moreInfo')}</ExternalLink>
            </span>
            <div className={styles.actions}>
                <Button primary={true} onClick={onEnableTelementry}>{getMessage('enable')}</Button>
                <Button primary={true} onClick={onDisableTelemetry}>{getMessage('noThanks')}</Button>
            </div>
        </>);
    };

    const getCurrentPage = () => {
        switch (page) {
            case Page.Config:
                return <ConfigPage disabled={isAnalyzing} onStart={onStart} />;
            case Page.Error:
                return <ErrorPage config={config} disabled={isAnalyzing} error={error} onConfigure={onConfigure} onRestart={onRestart} />;
            case Page.Results:
                return <ResultsPage disabled={isAnalyzing} config={config} results={results} onConfigure={onConfigure} onRestart={onRestart} />;
            default:
                throw new Error(`Unknown page: ${page}`);
        }
    };

    return (
        <div className={styles.root} data-theme={theme}>
            <Banner show={show}>
                {getBannerContent()}
            </Banner>
            <div className={styles.content}>
                {getCurrentPage()}
                {isAnalyzing && <Analyze config={config} onCancel={onCancel} onError={onError} onResults={onResults} onTimeout={onTimeout} />}
            </div>
        </div>
    );
};

export default withCurrentDesign(App);
