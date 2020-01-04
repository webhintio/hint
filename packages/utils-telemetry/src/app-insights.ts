type Measurements = { [key: string]: number };
type Properties = { [key: string]: string };

type TelemetryItem = {
    data: {
        baseData: {
            measurements: Measurements;
            name: string;
            properties: Properties;
            ver?: number;
        };
        baseType: string;
    };
    iKey: string;
    name: string;
    time: string;
};

const appInsightsEndpoint = 'https://dc.services.visualstudio.com/v2/track';

let nameKey = '';
let sendTimeout: NodeJS.Timeout | null = null;
let telemetryQueue: TelemetryItem[] = [];

let options = {
    batchDelay: 15000,
    defaultProperties: {} as Properties,
    enabled: false,
    instrumentationKey: '8ef2b55b-2ce9-4c33-a09a-2c3ef605c97d',
    post: (url: string, data: string) => {
        return Promise.resolve(200);
    }
};

/** Check if telemetry is currently enabled */
export const enabled = () => {
    return options.enabled;
};

/** Initialize telemetry with the provided options */
export const initTelemetry = (opts: Partial<typeof options>) => {
    options = { ...options, ...opts };
    nameKey = options.instrumentationKey.replace(/-/g, '');
};

/** Enable or disable telemetry */
export const updateTelemetry = (enabled: boolean) => {
    options.enabled = enabled;
};

const sendTelemetry = async () => {
    if (sendTimeout) {
        clearTimeout(sendTimeout);
        sendTimeout = null;
    }

    const data = JSON.stringify(telemetryQueue);

    telemetryQueue = [];

    try {
        const status = await options.post(appInsightsEndpoint, data);

        /* istanbul ignore next */
        if (status !== 200) {
            console.warn('Failed to send telemetry: ', status);
        }
    } catch (err) /* istanbul ignore next */ {
        console.warn('Failed to send telemetry: ', err);
    }
};

const track = async (type: string, data: TelemetryItem['data']['baseData']) => {
    if (!enabled()) {
        return;
    }

    telemetryQueue.push({
        data: {
            baseData: {
                measurements: data.measurements,
                name: data.name,
                properties: { ...options.defaultProperties, ...data.properties },
                ver: 2
            },
            baseType: `${type}Data`
        },
        iKey: options.instrumentationKey,
        name: `Microsoft.ApplicationInsights.${nameKey}.${type}`,
        time: new Date().toISOString()
    });

    if (!options.batchDelay) {
        await sendTelemetry();
    } else if (!sendTimeout) {
        sendTimeout = setTimeout(sendTelemetry, options.batchDelay);
    }
};

/** Log a named custom event to Application Insights (if telemetry is enabled) */
export const trackEvent = async (name: string, properties: Properties = {}, measurements: Measurements = {}) => {
    await track('Event', { measurements, name, properties });
};
