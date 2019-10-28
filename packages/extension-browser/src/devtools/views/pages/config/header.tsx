import * as React from 'react';

import { getMessage } from '../../../utils/i18n';

import Button from '../../controls/button';
import FeedbackLink from '../../controls/feedback-link';
import { Config } from '../../../../shared/types';

import * as styles from './header.css';

type Props = {
    config: Config;
}

const ConfigHeader = ({ config }: Props) => {
    return (
        <header className={styles.root}>
            <h1 className={styles.help}>
                {getMessage('checkForBestPracticesDescription')}
            </h1>
            <FeedbackLink config={config} />
            <Button type="submit" primary={true}>
                {getMessage('startScanButtonLabel')}
            </Button>
        </header>
    );
};

export default ConfigHeader;
