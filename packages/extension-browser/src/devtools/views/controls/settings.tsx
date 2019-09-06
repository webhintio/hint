import * as React from 'react';

import { getMessage } from '../../utils/i18n';

import TelemetrySettings from './telemetry-setting';

import Summary from './summary';

type Props = {
    isTelemetryEnabled: boolean;
    onTelemetryChange: (enable: boolean) => void;
};

const Settings = ({isTelemetryEnabled, onTelemetryChange}: Props) => {
    return (
        <details>
            <Summary>{getMessage('settings')}</Summary>
            <TelemetrySettings onTelemetryChange={onTelemetryChange} isTelemetryEnabled={isTelemetryEnabled}/>
        </details>
    );
};

export default Settings;
