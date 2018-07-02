/**
 * @fileoverview Allows to tests hints individually creating a server.
 */

import { URL } from 'url';

import { test, GenericTestContext, Context } from 'ava';
import * as retry from 'async-retry';
import { createServer } from '@hint/utils-create-server';

import { ids as connectors } from './connectors';
import { IHintConstructor, HintsConfigObject, Problem } from 'hint/dist/src/lib/types';
import * as resourceLoader from 'hint/dist/src/lib/utils/resource-loader';
import { HintTest, HintLocalTest, Report } from './hint-test-type';
import { Engine } from 'hint/dist/src/lib/engine';
import { Configuration } from 'hint/dist/src/lib/config';
import { getAsUri } from 'hint/dist/src/lib/utils/network/as-uri';

// Regex to replace all scenarios: `http(s)://localhost/`, `http(s)://localhost:3000/`
const localhostRegex = /(http|https):\/\/localhost[:]*[0-9]*\//g;

/**
 * Creates a valid hint configuration.
 */
const createConfig = (id: string, connector: string, opts?: any): Configuration => {
    const hints: HintsConfigObject = {};

    if (opts && opts.hintOptions) {
        hints[id] = ['error', opts.hintOptions];
    } else {
        hints[id] = 'error';
    }

    const config = {
        browserslist: opts && opts.browserslist || [],
        connector: {
            name: connector,
            options: {}
        },
        hints,
        parsers: opts && opts.parsers || []
    };

    if (connector === 'jsdom') {
        config.connector.options = {
            /*
             * Allow us to use our self-signed cert for testing.
             * https://github.com/request/request/issues/418#issuecomment-23058601
             */
            rejectUnauthorized: false,
            strictSSL: false
        };
    }

    if (connector === 'chrome') {
        // Allow us to use our self-signed cert for testing.
        config.connector.options = { overrideInvalidCert: true };
    }

    return Configuration.fromConfig(config);
};

/** Validates that the results from the execution match the expected ones. */
const validateResults = (t: GenericTestContext<Context<any>>, results: Array<Problem>, reports: Array<Report> | undefined) => {
    const server = t.context.server || {};

    if (!reports) {
        return t.is(results.length, 0, `Received results is ${JSON.stringify(results, null, 2)}`);
    }

    if (results.length === 0) {
        return t.fail(`No results found, should be ${reports.length}`);
    }

    if (results.length !== reports.length) {
        return t.fail(`Result count is ${results.length}, should be ${reports.length}`);
    }

    return reports.forEach((report, index: number) => {
        if (server.port) {
            t.is(results[index].message, report.message.replace(localhostRegex, `$1://localhost:${server.port}/`), `Different message`);
        } else {
            t.is(results[index].message, report.message, `Different message`);
        }
        if (report.position) {
            t.is(results[index].location.column, report.position.column, `Different column`);
            t.is(results[index].location.line, report.position.line, `Different line`);
        }
    });
};

/** Executes all the tests from `hintTests` in the hint whose id is `hintId` */
export const testHint = (hintId: string, hintTests: Array<HintTest>, configs: { [key: string]: any } = {}) => {
    /**
     * Because tests are executed asynchronously in ava, we need
     * a different server and hint object for each one
     */
    test.beforeEach(async (t) => {
        // When running serial tests, the server is shared
        if (typeof t.context.server !== 'undefined') {
            return;
        }
        t.context.server = createServer(configs.https);
        await t.context.server.start();
    });

    test.afterEach.always(async (t) => {
        await t.context.server.stop();
    });

    /**
     * Creates a new connector with only the hint to be tested and
     * executing any required `before` task as indicated by `hintTest`.
     */
    const createConnector = async (t: GenericTestContext<Context<any>>, hintTest: HintTest, connector: string, attemp: number): Promise<Engine> => {
        const { server } = t.context;
        const { serverConfig } = hintTest;

        if (hintTest.before) {
            await hintTest.before();
        }

        const config = createConfig(hintId, connector, configs);
        const resources = resourceLoader.loadResources(config);
        const engine: Engine = new Engine(config, resources);

        // We only configure the server the first time
        if (attemp === 1 && serverConfig) {
            server.configure(serverConfig);
        }

        return engine;
    };

    /**
     * Stops a connector executing any required `after` task as indicated by
     * `hintTest`.
     */
    const stopConnector = async (hintTest: HintTest, connector: Engine): Promise<void> => {
        if (hintTest.after) {
            await hintTest.after();
        }

        await connector.close();
    };

    /** Runs a test for the hint being tested */
    const runHint = (t: GenericTestContext<Context<any>>, hintTest: HintTest, connector: string) => {
        return retry(async (bail, attemp) => {
            if (attemp > 1) {
                console.log(`[${connector}] ${hintTest.name} - try ${attemp}`);
            }

            try {
                const { server } = t.context;
                const { serverUrl, reports } = hintTest;
                const target = serverUrl ? serverUrl : `${configs.https ? 'https' : 'http'}://localhost:${server.port}/`;

                const engine = await createConnector(t, hintTest, connector, attemp);
                const results = await engine.executeOn(new URL(target));

                await stopConnector(hintTest, engine);

                return validateResults(t, results, reports);
            } catch (e) {
                console.error(e);

                return false;
            }
        },
        {
            minTimeout: 10000,
            retries: 3
        });
    };

    const Hint: IHintConstructor = resourceLoader.loadHint(hintId, []);

    /* Run all the tests for a given hint in all connectors. */
    connectors.forEach((connector) => {

        /*
         * If the hint ignore the connector, then we don't
         * run the tests for this hint in this connector.
         */

        if (!Hint.meta.ignoredConnectors || !Hint.meta.ignoredConnectors.includes(connector)) {
            hintTests.forEach((hintTest) => {
                let runner;

                runner = configs['serial'] ? test.serial : test; // eslint-disable-line dot-notation

                /*
                 * If the tests for a hint ignores the connector, then we
                 * skip the tests
                 */
                if (configs.ignoredConnectors && configs.ignoredConnectors.includes(connector)) {
                    runner = test.skip;
                }

                runner(`[${connector}] ${hintTest.name}`, runHint, hintTest, connector);
            });
        }
    });
};

export const testLocalHint = (hintId: string, hintTests: Array<HintLocalTest>, configs: { [key: string]: any } = {}) => {
    const Hint: IHintConstructor = resourceLoader.loadHint(hintId, []);

    if (Hint.meta.ignoredConnectors && Hint.meta.ignoredConnectors.includes('local')) {
        return;
    }


    let runner: any;

    runner = configs.serial ? test.serial : test;

    /*
     * If the tests for a hint ignores the connector, then we
     * skip the tests
     */
    if (configs.ignoredConnectors && configs.ignoredConnectors.includes('local')) {
        runner = test.skip;
    }

    /** Runs a test for the hint being tested */
    const runHint = (t: GenericTestContext<Context<any>>, hintTest: HintLocalTest, connector: string) => {
        return retry(async (bail, attemp) => {
            if (attemp > 1) {
                console.log(`[${connector}] ${hintTest.name} - try ${attemp}`);
            }

            try {
                if (hintTest.before) {
                    await hintTest.before(t);
                }

                const hintConfig = createConfig(hintId, 'local', configs);
                const resources = resourceLoader.loadResources(hintConfig);
                const engine = new Engine(hintConfig, resources);

                const results = await engine.executeOn(getAsUri(hintTest.path));

                await engine.close();

                if (hintTest.after) {
                    await hintTest.after(t);
                }

                return validateResults(t, results, hintTest.reports);
            } catch (e) {
                console.error(e);

                return false;
            }
        },
        {
            minTimeout: 10000,
            retries: 3
        });
    };

    hintTests.forEach((hintTest) => {
        runner(`[local] ${hintTest.name}`, runHint, hintTest, 'local');
    });
};
