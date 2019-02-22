import anyTest, { TestInterface, ExecutionContext } from 'ava';
import * as proxyquire from 'proxyquire';
import * as sinon from 'sinon';

type ApplicationinsightsClient = {
    trackEvent: () => void;
    trackException: () => void;
};

type ApplicationInsights = {
    defaultClient: ApplicationinsightsClient;
};

type ApplicationInsightsExtended = ApplicationInsights & {
    setAutoCollectDependencies: () => ApplicationInsights;
    setAutoCollectExceptions: () => ApplicationInsights;
    setAutoCollectPerformance: () => ApplicationInsights;
    setAutoCollectRequests: () => ApplicationInsights;
    setAutoDependencyCorrelation: () => ApplicationInsights;
    setInternalLogging: () => ApplicationInsights;
    setup: () => ApplicationInsights;
    setUseDiskRetryCaching: () => ApplicationInsights;
    start: () => ApplicationinsightsClient;
};

type ConfigStore = {
    get: () => boolean;
    set: (field: string, value: any) => boolean;
}

type AppInsightsContext = {
    applicationinsights: ApplicationInsightsExtended;
    applicationinsightsClient: ApplicationinsightsClient;
    configStore: ConfigStore;
    miscGetHintPcakgeStub: sinon.SinonStub;
    sandbox: sinon.SinonSandbox;
};

const test = anyTest as TestInterface<AppInsightsContext>;

const initContext = (t: ExecutionContext<AppInsightsContext>) => {
    t.context.sandbox = sinon.createSandbox();

    const applicationinsightsClient: ApplicationinsightsClient = {
        trackEvent() { },
        trackException() { }
    };

    const applicationinsights: ApplicationInsightsExtended = {
        defaultClient: applicationinsightsClient,
        setAutoCollectDependencies() {
            return applicationinsights;
        },
        setAutoCollectExceptions() {
            return applicationinsights;
        },
        setAutoCollectPerformance() {
            return applicationinsights;
        },
        setAutoCollectRequests() {
            return applicationinsights;
        },
        setAutoDependencyCorrelation() {
            return applicationinsights;
        },
        setInternalLogging() {
            return applicationinsights;
        },
        setup() {
            return applicationinsights;
        },
        setUseDiskRetryCaching() {
            return applicationinsights;
        },
        start() {
            return applicationinsightsClient;
        }
    };

    t.context.applicationinsights = applicationinsights;
    t.context.applicationinsightsClient = applicationinsightsClient;
    t.context.configStore = {
        get(): boolean {
            return false;
        },
        set(field: string, value: any): boolean {
            return false;
        }
    };
};

const loadScript = (context: AppInsightsContext) => proxyquire('../../../src/lib/utils/app-insights', {
    './config-store': context.configStore,
    applicationinsights: context.applicationinsights
});

test.beforeEach(initContext);

test.afterEach.always((t) => {
    t.context.sandbox.restore();
});


test('If insight is not enabled it should use the dummy client', (t) => {
    const sandbox = t.context.sandbox;

    sandbox.stub(t.context.configStore, 'get').returns(false);
    const applicationinsightsSetupSpy = sandbox.spy(t.context.applicationinsights, 'setup');

    sandbox.stub(t.context.applicationinsights, 'start').returns(t.context.applicationinsightsClient);
    const applicationInsightClientTrackEventSpy = sandbox.spy(t.context.applicationinsightsClient, 'trackEvent');
    const applicationInsightClientTrackExceptionSpy = sandbox.spy(t.context.applicationinsightsClient, 'trackException');

    const insights = loadScript(t.context);

    insights.trackException(new Error());
    insights.trackEvent('event', { prop: 'value' });

    t.true(applicationinsightsSetupSpy.notCalled);
    t.true(applicationInsightClientTrackEventSpy.notCalled);
    t.true(applicationInsightClientTrackExceptionSpy.notCalled);
});

test('If insight is enabled it should use the real client', (t) => {
    const sandbox = t.context.sandbox;

    sandbox.stub(t.context.configStore, 'get').returns(true);
    const applicationinsightsSetupSpy = sandbox.spy(t.context.applicationinsights, 'setup');
    const applicationInsightClientTrackEventSpy = sandbox.spy(t.context.applicationinsightsClient, 'trackEvent');
    const applicationInsightClientTrackExceptionSpy = sandbox.spy(t.context.applicationinsightsClient, 'trackException');

    const insights = loadScript(t.context);

    insights.trackException(new Error());
    insights.trackEvent('event', { prop: 'value' });

    t.true(applicationinsightsSetupSpy.calledOnce);
    t.true(applicationInsightClientTrackEventSpy.calledOnce);
    t.true(applicationInsightClientTrackExceptionSpy.calledOnce);
});

test('Enable should set the insight configuration to true and enable application insights', (t) => {
    const sandbox = t.context.sandbox;

    const configStoreSetSpy = sandbox.spy(t.context.configStore, 'set');

    sandbox.stub(t.context.configStore, 'get').returns(false);
    const applicationinsightsSetupSpy = sandbox.spy(t.context.applicationinsights, 'setup');
    const applicationInsightClientTrackEventSpy = sandbox.spy(t.context.applicationinsightsClient, 'trackEvent');
    const applicationInsightClientTrackExceptionSpy = sandbox.spy(t.context.applicationinsightsClient, 'trackException');

    const insights = loadScript(t.context);

    insights.trackException(new Error());
    insights.trackEvent('event', { prop: 'value' });

    t.true(applicationinsightsSetupSpy.notCalled);
    t.true(applicationInsightClientTrackEventSpy.notCalled);
    t.true(applicationInsightClientTrackExceptionSpy.notCalled);

    insights.enable();
    insights.trackException(new Error());
    insights.trackEvent('event', { prop: 'value' });

    t.true(applicationinsightsSetupSpy.calledOnce);
    t.true(applicationInsightClientTrackEventSpy.calledOnce);
    t.true(applicationInsightClientTrackExceptionSpy.calledOnce);
    t.is(configStoreSetSpy.args[0][0], 'insight');
    t.is(configStoreSetSpy.args[0][1], true);
});

test('Disable should set the insight configuration to false', (t) => {
    const sandbox = t.context.sandbox;

    const configStoreSetSpy = sandbox.spy(t.context.configStore, 'set');

    sandbox.stub(t.context.configStore, 'get').returns(false);
    const applicationinsightsSetupSpy = sandbox.spy(t.context.applicationinsights, 'setup');
    const applicationInsightClientTrackEventSpy = sandbox.spy(t.context.applicationinsightsClient, 'trackEvent');
    const applicationInsightClientTrackExceptionSpy = sandbox.spy(t.context.applicationinsightsClient, 'trackException');

    const insights = loadScript(t.context);

    insights.disable();
    insights.trackException(new Error());
    insights.trackEvent('event', { prop: 'value' });

    t.true(applicationinsightsSetupSpy.notCalled);
    t.true(applicationInsightClientTrackEventSpy.notCalled);
    t.true(applicationInsightClientTrackExceptionSpy.notCalled);
    t.is(configStoreSetSpy.args[0][0], 'insight');
    t.is(configStoreSetSpy.args[0][1], false);
});
