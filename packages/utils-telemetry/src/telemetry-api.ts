type Measurements = { [key: string]: number };
type Properties = { [key: string]: string };

type TelemetryItem = {
    data: {
        measurements: Measurements;
        name: string;
        properties: Properties;
    };
    type: string;
    time: string;
};

const telemetryEndPoint = 'https://webhint-telemetry.azurewebsites.net/api/log';

let sendTimeout: NodeJS.Timeout | null = null;
let telemetryQueue: TelemetryItem[] = [];

let options = {
    batchDelay: 15000,
    defaultProperties: {} as Properties,
    enabled: false,
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
        const status = await options.post(telemetryEndPoint, data);

        /* istanbul ignore next */
        if (status !== 200) {
            console.warn('Failed to send telemetry: ', status);
        }
    } catch (err) /* istanbul ignore next */ {
        console.warn('Failed to send telemetry: ', err);
    }
};

const track = async (type: string, data: TelemetryItem['data']) => {
    if (!enabled()) {
        return;
    }

    telemetryQueue.push({
        data: {
            measurements: data.measurements,
            name: data.name,
            properties: { ...options.defaultProperties, ...data.properties }
        },
        time: new Date().toISOString(),
        type: `${type}Data`

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
