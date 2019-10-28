import * as React from 'react';

import { ErrorData, Config } from '../../../shared/types';

import { getMessage } from '../../utils/i18n';

import Button from '../controls/button';
import FeedbackLink from '../controls/feedback-link';
import Page from '../page';
import Summary from '../controls/summary';

import * as styles from './error.css';

type Props = {
    disabled?: boolean;

    /** Listener for when the user decides to configure a new scan. */
    onConfigure: () => void;

    /** Listener for when the user decides to run another scan. */
    onRestart: () => void;

    /** The error that occured when the scan failed. */
    error: ErrorData;

    /** Configuration used for the analysis. */
    config: Config;
};

/**
 * Display an error which occured during a scan.
 */
const ErrorPage = ({ disabled, error, onConfigure, onRestart, config }: Props) => {
    return (
        <Page disabled={disabled} onAction={onRestart}>
            <section className={styles.content}>
                <header>
                    <h1 className={styles.title}>
                        {getMessage('errorTitle')}
                    </h1>
                    <p>
                        {getMessage('errorMessage')}
                        <FeedbackLink config={config} error={error}>
                            {getMessage('openAnIssue')}
                        </FeedbackLink>
                    </p>
                    <div className={styles.actions}>
                        <Button type="submit" primary={true}>
                            {getMessage('scanAgainButtonLabel')}
                        </Button>
                        <Button type="button" onClick={onConfigure}>
                            {getMessage('newScanButtonLabel')}
                        </Button>
                    </div>
                </header>
                <main>
                    <details>
                        <Summary>
                            {getMessage('errorDetails')}
                        </Summary>
                        <pre>
                            {error.message}
                        </pre>
                        <pre className={styles.stack}>
                            {error.stack}
                        </pre>
                    </details>
                </main>
            </section>
        </Page>
    );
};

export default ErrorPage;
