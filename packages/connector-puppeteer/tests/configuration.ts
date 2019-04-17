import * as sinon from 'sinon';
import anyTest, { TestInterface } from 'ava';
import { Engine, Events } from 'hint';

import { runIfNoCiAndWindows } from './_run-if-no-ci-windows';
import { LifecycleLaunchOptions } from '../src/lib/lifecycle';
import proxyquire = require('proxyquire');

type SandboxContext = {
    sandbox: sinon.SinonSandbox;
};

type ConfigurationContext = {
    PuppeteerConnector: any;
    engine: Engine<Events>;
    launch: sinon.SinonSpy<[LifecycleLaunchOptions], never>;
};

const test = anyTest as TestInterface<SandboxContext>;

const tests = () => {

    const mockContext = (context: SandboxContext): ConfigurationContext => {

        const engine: Engine<Events> = {
            emit(): boolean {
                return false;
            },
            async emitAsync(): Promise<any> { },
            on(): Engine {
                return null as any;
            }
        } as any;

        const lifecycle = {
            close: () => {
                throw new Error('Close fail');
            },
            launch: (options: LifecycleLaunchOptions) => {
                throw new Error('Launch fail');
            }
        };

        const launch = context.sandbox.spy(lifecycle, 'launch');

        const script = proxyquire('../src/connector', { './lib/lifecycle': lifecycle });

        return {
            engine,
            launch,
            PuppeteerConnector: script.default
        };
    };

    test.beforeEach((t) => {
        t.context.sandbox = sinon.createSandbox();
    });

    test.afterEach.always((t) => {
        t.context.sandbox.restore();
    });

    test(`"detached" sets some options to "false" and is passed down`, async (t) => {
        const { engine, launch, PuppeteerConnector } = mockContext(t.context);
        const connector = new PuppeteerConnector(engine, { detached: true });

        try {
            await connector.collect('https://example.com');
        } catch (e) {
            // No need to check the exception
        }

        const options = launch.firstCall.args[0];

        t.true(launch.calledOnce);
        t.is(options.handleSIGHUP, false);
        t.is(options.handleSIGINT, false);
        t.is(options.handleSIGTERM, false);
        t.true(options.detached);
    });

    test(`"ignoreHTTPSErrors" adds "args" with the right value`, async (t) => {
        const { engine, launch, PuppeteerConnector } = mockContext(t.context);
        const connector = new PuppeteerConnector(engine, { ignoreHTTPSErrors: true });

        try {
            await connector.collect('https://example.com');
        } catch (e) {
            // No need to check the exception
        }

        const options = launch.firstCall.args[0];

        t.true(launch.calledOnce);
        t.true(options.ignoreHTTPSErrors);
        t.true((options.args as string[]).includes('--enable-features=NetworkService'));
    });

    test(`"puppeteerOptions" has higher priority than other properties`, async (t) => {
        const { engine, launch, PuppeteerConnector } = mockContext(t.context);
        const userOptions = {
            headless: false,
            ignoreHTTPSErrors: true,
            puppeteerOptions: {
                headless: true,
                ignoreHTTPSErrors: false
            }
        };
        const connector = new PuppeteerConnector(engine, userOptions);

        try {
            await connector.collect('https://example.com');
        } catch (e) {
            // No need to check the exception
        }

        const options = launch.firstCall.args[0];

        t.true(launch.calledOnce);
        t.is(options.ignoreHTTPSErrors, userOptions.puppeteerOptions.ignoreHTTPSErrors);
        t.is(options.headless, userOptions.puppeteerOptions.headless);
    });

};

runIfNoCiAndWindows(tests);
