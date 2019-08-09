import * as https from 'https';

type Measurements = { [key: string]: number };
type Properties = { [key: string]: string };

type TelemetryItem = {
    data: {
        baseData: {
            measurements: Measurements;
            name: string;
            properties: Properties;
            ver?: number
        };
        baseType: string;
    };
    iKey: string;
    name: string;
    time: string;
};

const appInsightsEndpoint = 'https://dc.services.visualstudio.com/v2/track';
const telemetryDelay = 15000;

let defaultProperties: Properties = {};
let instrumentationKey = '';
let nameKey = '';
let sendTimeout: NodeJS.Timeout | null = null;
let telemetryEnabled: boolean;
let telemetryQueue: TelemetryItem[] = [];

const sendTelemetry = () => {
    if (sendTimeout) {
        clearTimeout(sendTimeout);
        sendTimeout = null;
    }

    const request = https.request(appInsightsEndpoint, { method: 'POST' }, (response) => {
        if (response.statusCode !== 200) {
            console.error('Failed to send telemetry: ', response.statusCode);
        }
    });

    request.on('error', (err) => {
        console.error('Failed to send telemetry: ', err);
    });

    request.write(JSON.stringify(telemetryQueue));
    request.end();

    telemetryQueue = [];
};

const track = (type: string, data: TelemetryItem['data']['baseData']) => {
    if (!telemetryEnabled) {
        return;
    }

    telemetryQueue.push({
        data: {
            baseData: {
                measurements: data.measurements,
                name: data.name,
                properties: { ...defaultProperties, ...data.properties },
                ver: 2
            },
            baseType: `${type}Data`
        },
        iKey: instrumentationKey,
        name: `Microsoft.ApplicationInsights.${nameKey}.${type}`,
        time: new Date().toISOString()
    });

    if (!sendTimeout) {
        sendTimeout = setTimeout(sendTelemetry, telemetryDelay);
    }
};

export const initTelemetry = (key: string, defaults: Properties = {}, enabled: boolean) => {
    defaultProperties = defaults;
    instrumentationKey = key;
    nameKey = key.replace(/-/g, '');
    telemetryEnabled = enabled;
};

export const isTelemetryConfigured = () => {
    return telemetryEnabled !== null;
};

export const trackEvent = (name: string, properties: Properties = {}, measurements: Measurements = {}) => {
    track('Event', { name, measurements, properties });
};

export const updateTelemetry = (enabled: boolean) => {
    telemetryEnabled = enabled;
};
