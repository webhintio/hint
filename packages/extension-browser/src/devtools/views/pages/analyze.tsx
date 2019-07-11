import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';

import { Config, ErrorData, Results } from '../../../shared/types';

import { getMessage } from '../../utils/i18n';
import { useRotatingInspiration } from '../../utils/inspire';
import { sendMessage, useMessageListener } from '../../utils/messaging';
import { addNetworkListeners, removeNetworkListeners } from '../../utils/network';

import Button from '../controls/button';
import ProgressBar from '../controls/progress-bar';

import * as styles from './analyze.css';

import * as nellieWorkingSvg from '../../../images/nellie-working.svg';

const maxRunTime = 3 * 60 * 1000; // Three minutes.

const getScanDuration = (scanStart: number) => {
    return Math.round(performance.now() - scanStart);
};

type Props = {
    config: Config;

    /** Listener for when the user decides to cancel a scan. */
    onCancel: (duration: number) => void;

    /** Listener for when the scan fails with an error. */
    onError: (error: ErrorData) => void;

    /** Listener to receive the results of a scan after it completes. */
    onResults: (results: Results, duration: number) => void;

    /** Listener for when a scan fails to return after the max alloted time. */
    onTimeout: (duration: number) => void;
};

/**
 * Display progress and status while running a scan.
 */
const Analyze = ({ config, onCancel, onError, onResults, onTimeout }: Props) => {
    const [delayUntil, setDelayUntil] = useState(0);
    const [scanStart] = useState(performance.now());
    const [resultsTimeout, setResultsTimeout] = useState({} as NodeJS.Timeout);
    const status = useRotatingInspiration();

    // Handle starting and stopping a scan (whether complete, canceled, or after an error).
    useEffect(() => {
        addNetworkListeners();
        sendMessage({ enable: { config } }); // Tell the background script to start scanning.

        const timeout = setTimeout(() => {
            onTimeout(getScanDuration(scanStart));
        }, maxRunTime);

        return () => {
            clearTimeout(timeout);
            removeNetworkListeners();
            sendMessage({ done: true }); // Tell the background script to stop scanning.
        };
    }, [config, onTimeout, scanStart]);

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
        if (message.error) {
            onError(message.error);

            return;
        }

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
        <div className={styles.root}>
            <section role="dialog" className={styles.status} aria-label={getMessage('analyzingStatus')}>
                <h1 className={styles.header}>
                    {getMessage('analyzingStatus')}
                </h1>
                <div className={styles.messages}>
                    <div className={styles.message}>
                        <h2 className={styles.messageTitle}>{getMessage('didYouKnowThat')}</h2>
                        <span>{status}</span>
                    </div>
                    <img className={styles.image} src={nellieWorkingSvg} alt={getMessage('pictureOfMascot')} />
                </div>
                <ProgressBar className={styles.progress} />
                <Button autoFocus={true} primary={true} onClick={onCancelClick}>
                    {getMessage('cancelAnalysisButtonLabel')}
                </Button>
            </section>
        </div>
    );
};

export default Analyze;
