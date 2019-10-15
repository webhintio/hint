import * as React from 'react';
import { FormEvent, useCallback } from 'react';

import { getMessage } from '../../utils/i18n';

import ConfigLabel from '../pages/config/label';
import Checkbox from './checkbox';
import LabelText from './label-text';

type Props = {
    isTelemetryEnabled: boolean;
    onTelemetryChange: (enable: boolean) => void;
};

const TelemetrySetting = ({ isTelemetryEnabled, onTelemetryChange }: Props) => {
    const onEnabledChange = useCallback((event: FormEvent<HTMLInputElement>) => {
        const input = (event.target as HTMLInputElement);

        onTelemetryChange(input.checked);
    }, [onTelemetryChange]);

    return (
        <ConfigLabel>
            <Checkbox checked={isTelemetryEnabled} onChange={onEnabledChange} />
            <LabelText>
                {getMessage('telemetry')}
            </LabelText>
        </ConfigLabel>
    );
};

export default TelemetrySetting;
