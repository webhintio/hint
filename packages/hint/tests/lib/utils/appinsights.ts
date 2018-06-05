import * as path from 'path';

import test from 'ava';
import * as proxyquire from 'proxyquire';
import * as sinon from 'sinon';

const misc = { findPackageRoot() { } };

const applicationinsightsClient = {
    trackEvent() { },
    trackException() { }
};

const Configstore = function () { };

Configstore.prototype.get = () => { };
Configstore.prototype.set = () => { };

const applicationinsights = {
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
        return applicationinsights;
    }
};

proxyquire('../../../src/lib/utils/rule-helpers', { path });

test.before(() => {
    sinon.stub(misc, 'findPackageRoot').returns(path.join(__dirname, 'fixtures'));
});

test.after.always(() => {
    (misc.findPackageRoot as sinon.SinonStub).restore();
});

test.beforeEach((t) => {
    delete require.cache[require.resolve('applicationinsights')];
    delete require.cache[require.resolve('configstore')];
    delete require.cache[path.resolve(__dirname, '../../../src/lib/utils/appinsights.js')];

    t.context.applicationinsights = applicationinsights;
    t.context.applicationinsightsClient = applicationinsightsClient;
});

test.serial('If insight is not enabled it should use the dummy client', (t) => {
    const sandbox = sinon.createSandbox();

    sandbox.stub(Configstore.prototype, 'get').returns(false);
    sandbox.spy(applicationinsights, 'setup');
    sandbox.stub(applicationinsights, 'start').returns(applicationinsightsClient);
    sandbox.spy(applicationinsightsClient, 'trackEvent');
    sandbox.spy(applicationinsightsClient, 'trackException');

    proxyquire('../../../src/lib/utils/appinsights', {
        './misc': misc,
        applicationinsights,
        configstore: Configstore
    });

    const insights = require('../../../src/lib/utils/appinsights');

    insights.trackException(new Error());
    insights.trackEvent('event', { prop: 'value' });

    t.true(t.context.applicationinsights.setup.notCalled);
    t.true(t.context.applicationinsightsClient.trackEvent.notCalled);
    t.true(t.context.applicationinsightsClient.trackException.notCalled);

    sandbox.restore();
});

test.serial('If insight is enabled it should use the real client', (t) => {
    const sandbox = sinon.createSandbox();

    sandbox.stub(Configstore.prototype, 'get').returns(true);
    sandbox.spy(applicationinsights, 'setup');
    sandbox.spy(applicationinsightsClient, 'trackEvent');
    sandbox.spy(applicationinsightsClient, 'trackException');

    proxyquire('../../../src/lib/utils/appinsights', {
        './misc': misc,
        applicationinsights,
        configstore: Configstore
    });

    const insights = require('../../../src/lib/utils/appinsights');

    insights.trackException(new Error());
    insights.trackEvent('event', { prop: 'value' });

    t.true(t.context.applicationinsights.setup.calledOnce);
    t.true(t.context.applicationinsightsClient.trackEvent.calledOnce);
    t.true(t.context.applicationinsightsClient.trackException.calledOnce);

    sandbox.restore();
});

test.serial('Enable should set the insight configuration to true and enable application insights', (t) => {
    const sandbox = sinon.createSandbox();

    t.context.Configstore = Configstore;

    sandbox.stub(Configstore.prototype, 'get').returns(false);
    sandbox.spy(Configstore.prototype, 'set');
    sandbox.spy(applicationinsights, 'setup');
    sandbox.spy(applicationinsightsClient, 'trackEvent');
    sandbox.spy(applicationinsightsClient, 'trackException');

    proxyquire('../../../src/lib/utils/appinsights', {
        './misc': misc,
        applicationinsights,
        configstore: Configstore
    });

    const insights = require('../../../src/lib/utils/appinsights');

    insights.trackException(new Error());
    insights.trackEvent('event', { prop: 'value' });

    t.true(t.context.applicationinsights.setup.notCalled);
    t.true(t.context.applicationinsightsClient.trackEvent.notCalled);
    t.true(t.context.applicationinsightsClient.trackException.notCalled);

    insights.enable();
    insights.trackException(new Error());
    insights.trackEvent('event', { prop: 'value' });

    t.true(t.context.applicationinsights.setup.calledOnce);
    t.true(t.context.applicationinsightsClient.trackEvent.calledOnce);
    t.true(t.context.applicationinsightsClient.trackException.calledOnce);
    t.is(t.context.Configstore.prototype.set.args[0][0], 'insight');
    t.is(t.context.Configstore.prototype.set.args[0][1], true);

    sandbox.restore();
});

test.serial('Disable should set the insight configuration to false', (t) => {
    const sandbox = sinon.createSandbox();

    t.context.Configstore = Configstore;

    sandbox.stub(Configstore.prototype, 'get').returns(false);
    sandbox.spy(Configstore.prototype, 'set');
    sandbox.spy(applicationinsights, 'setup');
    sandbox.spy(applicationinsightsClient, 'trackEvent');
    sandbox.spy(applicationinsightsClient, 'trackException');

    proxyquire('../../../src/lib/utils/appinsights', {
        './misc': misc,
        applicationinsights,
        configstore: Configstore
    });

    const insights = require('../../../src/lib/utils/appinsights');

    insights.disable();
    insights.trackException(new Error());
    insights.trackEvent('event', { prop: 'value' });

    t.true(t.context.applicationinsights.setup.notCalled);
    t.true(t.context.applicationinsightsClient.trackEvent.notCalled);
    t.true(t.context.applicationinsightsClient.trackException.notCalled);
    t.is(t.context.Configstore.prototype.set.args[0][0], 'insight');
    t.is(t.context.Configstore.prototype.set.args[0][1], false);

    sandbox.restore();
});
