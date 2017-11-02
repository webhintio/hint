/**
 * @fileoverview Allows to tests rules individually creating a server.
 */

import * as url from 'url';

import { test } from 'ava';
import * as retry from 'async-retry';

import { ids as connectors } from './connectors';
import { createServer } from './test-server';
import { IConfig } from '../../src/lib/types';
import * as resourceLoader from '../../src/lib/utils/resource-loader';
import { IRuleTest } from './rule-test-type';
import { Sonar } from '../../src/lib/sonar';

/** Executes all the tests from `ruleTests` in the rule whose id is `ruleId` */
export const testRule = (ruleId: string, ruleTests: Array<IRuleTest>, configs: { [key: string]: any } = {}) => {

    /**
     * Creates a valid sonar configuration. Eventually we should
     * test all available connectors and not only JSDOM
     */
    const createConfig = (id: string, connector: string, opts?): IConfig => {
        const rules = {};

        if (opts && opts.ruleOptions) {
            rules[id] = ['error', opts.ruleOptions];
        } else {
            rules[id] = 'error';
        }

        const config = {
            browserslist: opts && opts.browserslist || [],
            connector: {
                name: connector,
                options: {}
            },
            rules
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

        return config;
    };

    /**
     * Because tests are executed asynchronously in ava, we need
     * a different server and sonar object for each one
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

    /** Validates that the results from the execution match the expected ones. */
    const validateResults = (t, results, reports) => {
        const { server } = t.context;

        if (!reports) {
            return t.is(results.length, 0, `Received results is ${JSON.stringify(results, null, 2)}`);
        }

        if (results.length === 0) {
            return t.fail(`No results found, should be ${reports.length}`);
        }

        if (results.length !== reports.length) {
            return t.fail(`Result count is ${results.length}, should be ${reports.length}`);
        }

        return reports.forEach((report, index) => {
            // Replace all scenarios: `http(s)://localhost/`, `http(s)://localhost:3000/`
            const localhostRegex = /(http|https):\/\/localhost[:]*[0-9]*\//g;

            t.is(results[index].message, report.message.replace(localhostRegex, `$1://localhost:${server.port}/`), `Different message`);

            if (report.position) {
                t.is(results[index].location.column, report.position.column, `Different column`);
                t.is(results[index].location.line, report.position.line, `Different line`);
            }
        });
    };

    /**
     * Creates a new connector with just the rule to be tested and executing
     * any required `before` task as indicated by `ruleTest`.
     */
    const createConnector = async (t, ruleTest: IRuleTest, connector: string, attemp: number): Promise<Sonar> => {
        const { server } = t.context;
        const { serverConfig } = ruleTest;

        if (ruleTest.before) {
            await ruleTest.before();
        }

        const sonar: Sonar = new Sonar(createConfig(ruleId, connector, configs));

        // We only configure the server the first time
        if (attemp === 1 && serverConfig) {
            server.configure(serverConfig);
        }

        return sonar;
    };

    /**
     * Stops a connector executing any required `after` task as indicated by
     * `ruleTest`.
     */
    const stopConnector = async (ruleTest: IRuleTest, connector): Promise<void> => {
        if (ruleTest.after) {
            await ruleTest.after();
        }

        await connector.close();
    };

    /** Runs a test for the rule being tested */
    const runRule = (t, ruleTest: IRuleTest, connector: string) => {
        return retry(async (bail, attemp) => {
            if (attemp > 1) {
                console.log(`[${connector}] ${ruleTest.name} - try ${attemp}`);
            }

            try {
                const { server } = t.context;
                const { serverUrl, reports } = ruleTest;
                const target = serverUrl ? serverUrl : `${configs.https ? 'https' : 'http'}://localhost:${server.port}/`;

                const sonar = await createConnector(t, ruleTest, connector, attemp);
                const results = await sonar.executeOn(url.parse(target));

                await stopConnector(ruleTest, sonar);

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

    const rule = resourceLoader.loadRule(ruleId);

    /* Run all the tests for a given rule in all connectors. */
    connectors.forEach((connector) => {

        /*
         * If the rule ignore the connector, then we don't
         * run the tests for this rule in this connector.
         */

        if (!rule.meta.ignoredConnectors || !rule.meta.ignoredConnectors.includes(connector)) {
            ruleTests.forEach((ruleTest) => {
                let runner;

                runner = configs['serial'] ? test.serial : test; // eslint-disable-line dot-notation

                /*
                 * If the tests for a rule ignores the connector, then we
                 * skip the tests
                 */
                if (configs.ignoredConnectors && configs.ignoredConnectors.includes(connector)) {
                    runner = test.skip;
                }

                runner(`[${connector}] ${ruleTest.name}`, runRule, ruleTest, connector);
            });
        }
    });
};
