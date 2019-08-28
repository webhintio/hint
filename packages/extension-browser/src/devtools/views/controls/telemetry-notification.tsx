import * as React from 'react';
import { useCallback, useState } from 'react';

import * as styles from './telemetry-notification.css';

import Button from './button';
import ExternalLink from './external-link';
import Notification from './notification';

import { enable as enableTelemetry, disable as disableTelemetry, showOptIn } from '../../utils/analytics';
import { getMessage } from '../../utils/i18n';

const TelemetryNotification = () => {
    const [show, setShow] = useState(showOptIn());

    const onEnableTelementry = useCallback(() => {
        setShow(false);
        enableTelemetry();
    }, []);

    const onDisableTelemetry = useCallback(() => {
        setShow(false);
        disableTelemetry();
    }, []);

    const getActions = () => {
        return (<>
            <Button primary={true} onClick={onEnableTelementry}>{getMessage('enable')}</Button>
            <Button primary={true} onClick={onDisableTelemetry}>{getMessage('noThanks')}</Button>
            </>);
    };

    return (
        <Notification show={show} actions={getActions()}>
            <span className={styles.message}>
                {getMessage('helpUs')}
                &nbsp;<ExternalLink href="https://webhint.io/docs/user-guide/telemetry/summary/">{getMessage('learnMore')}</ExternalLink>
            </span>
        </Notification>
    );
};

export default TelemetryNotification;
