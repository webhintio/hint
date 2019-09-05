import * as React from 'react';
import { FormEvent, useCallback } from 'react';

import { getMessage } from '../../utils/i18n';

import Summary from './summary';
import ConfigLabel from '../pages/config/label';
import Checkbox from './checkbox';
import LabelText from './label-text';

import * as styles from './settings.css';

const settings = { telemetry: 'telemetry' };

type Props = {
    isTelemetryEnabled: boolean;
    onTelemetryChange: (enable?: boolean) => void;
};

const Settings = ({isTelemetryEnabled, onTelemetryChange}: Props) => {

    const onEnabledChange = useCallback((event: FormEvent<HTMLInputElement>) => {
        const input = (event.target as HTMLInputElement);
        const setting = input.value;

        if (setting === settings.telemetry) {
            onTelemetryChange(input.checked);
        }
    }, [onTelemetryChange]);

    return (
        <details className={styles.root}>
            <Summary>{getMessage('settings')}</Summary>
            <ConfigLabel>
                <Checkbox value={'telemetry'} checked={isTelemetryEnabled} onChange={onEnabledChange} />
                <LabelText>
                    {getMessage('telemetry')}
                </LabelText>
            </ConfigLabel>
        </details>
    );
};

export default Settings;
