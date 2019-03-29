import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';

import { Results } from '../../../shared/types';

import { getMessage } from '../../utils/i18n';
import { useRotatingInspiration } from '../../utils/inspire';
import { useMessageListener } from '../../utils/messaging';

import AppButton from '../app-button';
import Page from '../page';

import * as styles from './analyze.css';

import * as nellieWorkingSvg from '../../../nellie-working.svg';

const getScanDuration = (scanStart: number) => {
    return Math.round(performance.now() - scanStart);
};

type Props = {
    /** Listener for when the user decides to cancel a scan. */
    onCancel: (duration: number) => void;

    /** Listener to receive the results of a scan after it completes. */
    onResults: (results: Results, duration: number) => void;
};

/**
 * Display progress and status while running a scan.
 */
const AnalyzePage = ({ onCancel, onResults }: Props) => {
    const [delayUntil, setDelayUntil] = useState(0);
    const [scanStart] = useState(performance.now());
    const [resultsTimeout, setResultsTimeout] = useState({} as NodeJS.Timeout);
    const status = useRotatingInspiration(getMessage('analyzingStatus'));

    /*
     * Wait 5s after each status change before calling `onResults`.
     * Gives users a chance to read the last message before it disappears.
     * Does not delay calling `onCancel`.
     */
    useEffect(() => {
        setDelayUntil(performance.now() + 5000);
    }, [status]); // Only reset the delay on status changes.

    // Listen for results from the background script.
    useMessageListener((message) => {
        if (!message.results) {
            return;
        }

        const results = message.results;
        const duration = getScanDuration(scanStart);

        const showResults = () => {
            onResults(results, duration);
        };

        if (performance.now() < delayUntil) {
            setResultsTimeout(setTimeout(showResults, delayUntil - performance.now()));
        } else {
            showResults();
        }
    });

    const onCancelClick = useCallback(() => {
        clearTimeout(resultsTimeout);
        onCancel(getScanDuration(scanStart));
    }, [onCancel, resultsTimeout, scanStart]);

    return (
        <Page title={getMessage('analyzingStatus')} actionDisabled={true} actionName={getMessage('analyzeButtonLabel')}>
            <section className={styles.status}>
                <img className={styles.image} src={nellieWorkingSvg} />
                <p className={styles.message}>
                    {status}
                </p>
                <AppButton primary={true} onClick={onCancelClick}>
                    {getMessage('cancelAnalysisButtonLabel')}
                </AppButton>
            </section>
        </Page>
    );
};

export default AnalyzePage;
