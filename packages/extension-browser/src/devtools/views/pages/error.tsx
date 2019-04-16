import * as React from 'react';

import { ErrorData } from '../../../shared/types';

import { getMessage } from '../../utils/i18n';

import Page from '../page';

import * as styles from './error.css';

const openIssueUrl = 'https://github.com/webhintio/hint/issues/new?labels=type%3Abug&amp;template=1-bug-report.md&amp;title=%5BBug%5D+Bug+description';

type Props = {
    /** Listener for when the user decides to run another scan. */
    onRestart: () => void;

    /** The error that occured when the scan failed. */
    error: ErrorData;
};

/**
 * Display an error which occured during a scan.
 */
const ErrorPage = ({ error, onRestart }: Props) => {
    return (
        <Page title={getMessage('errorTitle')} actionName={getMessage('analyzeAgainButtonLabel')} onAction={onRestart}>
            <section className={styles.content}>
                <p>
                    {getMessage('errorMessage')}
                    <a href={openIssueUrl} rel="noopener noreferrer" target="_blank">
                        {getMessage('openAnIssue')}
                    </a>
                </p>
                <details>
                    <summary>
                        {getMessage('errorDetails')}
                    </summary>
                    <pre>
                        {error.message}
                    </pre>
                    <pre className={styles.stack}>
                        {error.stack}
                    </pre>
                </details>
            </section>
        </Page>
    );
};

export default ErrorPage;
