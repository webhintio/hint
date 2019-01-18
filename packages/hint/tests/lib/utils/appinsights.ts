import * as path from 'path';

import anyTest, { TestInterface } from 'ava';
import * as proxyquire from 'proxyquire';
import * as sinon from 'sinon';

const misc = {
    getHintPackage(): string {
        return '';
    }
};

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

const applicationinsightsClient: ApplicationinsightsClient = {
    trackEvent() { },
    trackException() { }
};

const configStore = {
    get(): boolean {
        return false;
    },
    set(field: string, value: any): boolean {
        return false;
    }
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

proxyquire('../../../src/lib/utils/hint-helpers', {
    './configstore': configStore,
    path
});

type AppInsightsContext = {
    miscGetHintPcakgeStub: sinon.SinonStub;
};

const test = anyTest as TestInterface<AppInsightsContext>;

test.before((t) => {
    t.context.miscGetHintPcakgeStub = sinon.stub(misc, 'getHintPackage').returns(path.join(__dirname, 'fixtures'));
});

test.after.always((t) => {
    t.context.miscGetHintPcakgeStub.restore();
});

test.beforeEach((t) => {
    delete require.cache[require.resolve('applicationinsights')];
    delete require.cache[path.resolve(__dirname, '../../../src/lib/utils/appinsights.js')];
    delete require.cache[path.resolve(__dirname, '../../../src/lib/utils/configstore.js')];
});

test.serial('If insight is not enabled it should use the dummy client', (t) => {
    const sandbox = sinon.createSandbox();

    sandbox.stub(configStore, 'get').returns(false);
    const applicationinsightsSetupSpy = sandbox.spy(applicationinsights, 'setup');

    sandbox.stub(applicationinsights, 'start').returns(applicationinsightsClient);
    const applicationInsightClientTrackEventSpy = sandbox.spy(applicationinsightsClient, 'trackEvent');
    const applicationInsightClientTrackExceptionSpy = sandbox.spy(applicationinsightsClient, 'trackException');

    proxyquire('../../../src/lib/utils/appinsights', {
        './configstore': configStore,
        './packages/load-hint-package': misc,
        applicationinsights
    });

    const insights = require('../../../src/lib/utils/appinsights');

    insights.trackException(new Error());
    insights.trackEvent('event', { prop: 'value' });

    t.true(applicationinsightsSetupSpy.notCalled);
    t.true(applicationInsightClientTrackEventSpy.notCalled);
    t.true(applicationInsightClientTrackExceptionSpy.notCalled);

    sandbox.restore();
});

test.serial('If insight is enabled it should use the real client', (t) => {
    const sandbox = sinon.createSandbox();

    sandbox.stub(configStore, 'get').returns(true);
    const applicationinsightsSetupSpy = sandbox.spy(applicationinsights, 'setup');
    const applicationInsightClientTrackEventSpy = sandbox.spy(applicationinsightsClient, 'trackEvent');
    const applicationInsightClientTrackExceptionSpy = sandbox.spy(applicationinsightsClient, 'trackException');

    proxyquire('../../../src/lib/utils/appinsights', {
        './configstore': configStore,
        './packages/load-hint-package': misc,
        applicationinsights
    });

    const insights = require('../../../src/lib/utils/appinsights');

    insights.trackException(new Error());
    insights.trackEvent('event', { prop: 'value' });

    t.true(applicationinsightsSetupSpy.calledOnce);
    t.true(applicationInsightClientTrackEventSpy.calledOnce);
    t.true(applicationInsightClientTrackExceptionSpy.calledOnce);

    sandbox.restore();
});

test.serial('Enable should set the insight configuration to true and enable application insights', (t) => {
    const sandbox = sinon.createSandbox();

    const configStoreSetSpy = sandbox.spy(configStore, 'set');

    sandbox.stub(configStore, 'get').returns(false);
    const applicationinsightsSetupSpy = sandbox.spy(applicationinsights, 'setup');
    const applicationInsightClientTrackEventSpy = sandbox.spy(applicationinsightsClient, 'trackEvent');
    const applicationInsightClientTrackExceptionSpy = sandbox.spy(applicationinsightsClient, 'trackException');

    proxyquire('../../../src/lib/utils/appinsights', {
        './configstore': configStore,
        './packages/load-hint-package': misc,
        applicationinsights
    });

    const insights = require('../../../src/lib/utils/appinsights');

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

    sandbox.restore();
});

test.serial('Disable should set the insight configuration to false', (t) => {
    const sandbox = sinon.createSandbox();

    const configStoreSetSpy = sandbox.spy(configStore, 'set');

    sandbox.stub(configStore, 'get').returns(false);
    const applicationinsightsSetupSpy = sandbox.spy(applicationinsights, 'setup');
    const applicationInsightClientTrackEventSpy = sandbox.spy(applicationinsightsClient, 'trackEvent');
    const applicationInsightClientTrackExceptionSpy = sandbox.spy(applicationinsightsClient, 'trackException');

    proxyquire('../../../src/lib/utils/appinsights', {
        './configstore': configStore,
        './packages/load-hint-package': misc,
        applicationinsights
    });

    const insights = require('../../../src/lib/utils/appinsights');

    insights.disable();
    insights.trackException(new Error());
    insights.trackEvent('event', { prop: 'value' });

    t.true(applicationinsightsSetupSpy.notCalled);
    t.true(applicationInsightClientTrackEventSpy.notCalled);
    t.true(applicationInsightClientTrackExceptionSpy.notCalled);
    t.is(configStoreSetSpy.args[0][0], 'insight');
    t.is(configStoreSetSpy.args[0][1], false);

    sandbox.restore();
});
