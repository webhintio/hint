import * as React from 'react';

import { getMessage } from '../utils/i18n';

import AppButton from './app-button';

import * as styles from './page-header.css';

type Props = {
    actionDisabled?: boolean;
    actionName: string;
};

const PageHeader = ({ actionDisabled, actionName }: Props) => {
    return (
        <header className={styles.root}>
            <div className={styles.actions}>
                <AppButton type="submit" className={styles.button} primary={true} disabled={actionDisabled}>
                    {actionName}
                </AppButton>
            </div>
            <div className={styles.help}>
                {getMessage('checkForBestPracticesDescription')}
                {' '}
                <span className={styles.poweredBy}>
                    {getMessage('poweredByLabel')}
                    {' '}
                    <a href="https://webhint.io" rel="noopener" target="_blank">webhint</a>
                </span>
            </div>
        </header>
    );
};

export default PageHeader;
