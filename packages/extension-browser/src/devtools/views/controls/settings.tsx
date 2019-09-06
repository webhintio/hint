import * as React from 'react';

import { getMessage } from '../../utils/i18n';

import Summary from './summary';
import TelemetrySetting from './telemetry-setting';

type Props = {
    isTelemetryEnabled: boolean;
    onTelemetryChange: (enable: boolean) => void;
};

const Settings = ({isTelemetryEnabled, onTelemetryChange}: Props) => {
    return (
        <details>
            <Summary>{getMessage('settings')}</Summary>
            <TelemetrySetting onTelemetryChange={onTelemetryChange} isTelemetryEnabled={isTelemetryEnabled}/>
        </details>
    );
};

export default Settings;
