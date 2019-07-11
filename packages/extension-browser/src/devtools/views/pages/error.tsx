import * as React from 'react';

import { ErrorData } from '../../../shared/types';

import { getMessage } from '../../utils/i18n';

import Button from '../controls/button';
import ExternalLink from '../controls/external-link';
import Page from '../page';
import Summary from '../controls/summary';

import * as styles from './error.css';

const openIssueUrl = 'https://github.com/webhintio/hint/issues/new?labels=type%3Abug&amp;template=2-bug-report-browser.md&amp;title=%5BBug%5D+Bug+description';

type Props = {
    disabled?: boolean;

    /** Listener for when the user decides to configure a new scan. */
    onConfigure: () => void;

    /** Listener for when the user decides to run another scan. */
    onRestart: () => void;

    /** The error that occured when the scan failed. */
    error: ErrorData;
};

/**
 * Display an error which occured during a scan.
 */
const ErrorPage = ({ disabled, error, onConfigure, onRestart }: Props) => {
    return (
        <Page disabled={disabled} onAction={onRestart}>
            <section className={styles.content}>
                <p>
                    {getMessage('errorMessage')}
                    <ExternalLink href={openIssueUrl}>
                        {getMessage('openAnIssue')}
                    </ExternalLink>
                </p>
                <div className={styles.actions}>
                    <Button type="submit" primary={true}>
                        {getMessage('scanAgainButtonLabel')}
                    </Button>
                    <Button type="button" onClick={onConfigure}>
                        {getMessage('newScanButtonLabel')}
                    </Button>
                </div>
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
            </section>
        </Page>
    );
};

export default ErrorPage;
