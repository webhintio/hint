import * as React from 'react';
import { useCallback } from 'react';

import * as styles from './telemetry-notification.css';

import Button from './button';
import ExternalLink from './external-link';
import Notification from './notification';

import { getMessage } from '../../utils/i18n';

type Props = {
    show: boolean;
    onTelemetryChange: (enable: boolean) => void;
}

const TelemetryNotification = ({ onTelemetryChange, show }: Props) => {
    const onEnableTelementry = useCallback(() => {
        onTelemetryChange(true);
    }, [onTelemetryChange]);

    const onDisableTelemetry = useCallback(() => {
        onTelemetryChange(false);
    }, [onTelemetryChange]);

    const actions = [
        <Button key="1" primary={true} onClick={onEnableTelementry}>{getMessage('enable')}</Button>,
        <Button key="2" primary={true} onClick={onDisableTelemetry}>{getMessage('noThanks')}</Button>
    ];

    return (
        <Notification show={show} actions={actions}>
            <span className={styles.message}>
                {getMessage('helpUs')}
                {' '}
                <ExternalLink href="https://webhint.io/docs/user-guide/telemetry/summary/">{getMessage('learnMore')}</ExternalLink>
            </span>
        </Notification>
    );
};

export default TelemetryNotification;
