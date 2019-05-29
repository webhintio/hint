import * as React from 'react';

import { getMessage } from '../../utils/i18n';

import ExternalLink from './external-link';

import * as styles from './feedback.css';

const openIssueUrl = 'https://github.com/webhintio/hint/issues/new?labels=type%3Abug&amp;template=2-bug-report-browser.md&amp;title=%5BBug%5D+Bug+description';

/**
 * Link to github to give feedback.
 */
const Feedback = () => {
    return (
        <span className={styles.root}>
            <ExternalLink href={openIssueUrl}>
                {getMessage('feedback')}
            </ExternalLink>
        </span>
    );
};

export default Feedback;
