import * as React from 'react';
import { useCallback, useState } from 'react';

import Button from './button';
import ExternalLink from './external-link';

import { showOptIn, enable, disable } from '../../utils/analytics';
import { getMessage } from '../../utils/i18n';

import * as styles from './opt-in.css';

const TelemetryOptIn = () => {
    const [show, setShow] = useState(showOptIn());

    const enableTelementry = useCallback(() => {
        setShow(false);
        enable();
    }, []);

    const disableTelemetry = useCallback(() => {
        setShow(false);
        disable();
    }, []);

    return (<div className={`${styles.root} ${!show ? styles.hidden : ''}`}>
        <span className={styles.message}>
            {getMessage('helpUs')}
            &nbsp;<ExternalLink href="https://webhint.io/docs/user-guide/telemetry/summary/">{getMessage('moreInfo')}</ExternalLink>
        </span>
        <div className={styles.actions}>
            <Button primary={true} onClick={enableTelementry}>{getMessage('enable')}</Button>
            <Button primary={true} onClick={disableTelemetry}>{getMessage('noThanks')}</Button>
        </div>
    </div>);
};

export default TelemetryOptIn;
