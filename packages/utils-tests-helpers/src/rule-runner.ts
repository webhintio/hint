/**
 * @fileoverview Allows to tests rules individually creating a server.
 */

import { URL } from 'url';

import { test, GenericTestContext, Context } from 'ava';
import * as retry from 'async-retry';
import { createServer } from '@hint/utils-create-server';

import { ids as connectors } from './connectors';
import { IRuleConstructor, RulesConfigObject, Problem } from 'hint/dist/src/lib/types';
import * as resourceLoader from 'hint/dist/src/lib/utils/resource-loader';
import { RuleTest, RuleLocalTest, Report } from './rule-test-type';
import { Engine } from 'hint/dist/src/lib/engine';
import { HintConfig } from 'hint/dist/src/lib/config';
import { getAsUri } from 'hint/dist/src/lib/utils/network/as-uri';

// Regex to replace all scenarios: `http(s)://localhost/`, `http(s)://localhost:3000/`
const localhostRegex = /(http|https):\/\/localhost[:]*[0-9]*\//g;

/**
 * Creates a valid hint configuration.
 */
const createConfig = (id: string, connector: string, opts?: any): HintConfig => {
    const rules: RulesConfigObject = {};

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
        parsers: opts && opts.parsers || [],
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

    return HintConfig.fromConfig(config);
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

/** Executes all the tests from `ruleTests` in the rule whose id is `ruleId` */
export const testRule = (ruleId: string, ruleTests: Array<RuleTest>, configs: { [key: string]: any } = {}) => {
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
     * Creates a new connector with only the rule to be tested and
     * executing any required `before` task as indicated by `ruleTest`.
     */
    const createConnector = async (t: GenericTestContext<Context<any>>, ruleTest: RuleTest, connector: string, attemp: number): Promise<Engine> => {
        const { server } = t.context;
        const { serverConfig } = ruleTest;

        if (ruleTest.before) {
            await ruleTest.before();
        }

        const config = createConfig(ruleId, connector, configs);
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
     * `ruleTest`.
     */
    const stopConnector = async (ruleTest: RuleTest, connector: Engine): Promise<void> => {
        if (ruleTest.after) {
            await ruleTest.after();
        }

        await connector.close();
    };

    /** Runs a test for the rule being tested */
    const runRule = (t: GenericTestContext<Context<any>>, ruleTest: RuleTest, connector: string) => {
        return retry(async (bail, attemp) => {
            if (attemp > 1) {
                console.log(`[${connector}] ${ruleTest.name} - try ${attemp}`);
            }

            try {
                const { server } = t.context;
                const { serverUrl, reports } = ruleTest;
                const target = serverUrl ? serverUrl : `${configs.https ? 'https' : 'http'}://localhost:${server.port}/`;

                const engine = await createConnector(t, ruleTest, connector, attemp);
                const results = await engine.executeOn(new URL(target));

                await stopConnector(ruleTest, engine);

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

    const Rule: IRuleConstructor = resourceLoader.loadRule(ruleId, []);

    /* Run all the tests for a given rule in all connectors. */
    connectors.forEach((connector) => {

        /*
         * If the rule ignore the connector, then we don't
         * run the tests for this rule in this connector.
         */

        if (!Rule.meta.ignoredConnectors || !Rule.meta.ignoredConnectors.includes(connector)) {
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

export const testLocalRule = (ruleId: string, ruleTests: Array<RuleLocalTest>, configs: { [key: string]: any } = {}) => {
    const Rule: IRuleConstructor = resourceLoader.loadRule(ruleId, []);

    if (Rule.meta.ignoredConnectors && Rule.meta.ignoredConnectors.includes('local')) {
        return;
    }


    let runner: any;

    runner = configs.serial ? test.serial : test;

    /*
     * If the tests for a rule ignores the connector, then we
     * skip the tests
     */
    if (configs.ignoredConnectors && configs.ignoredConnectors.includes('local')) {
        runner = test.skip;
    }

    /** Runs a test for the rule being tested */
    const runRule = (t: GenericTestContext<Context<any>>, ruleTest: RuleLocalTest, connector: string) => {
        return retry(async (bail, attemp) => {
            if (attemp > 1) {
                console.log(`[${connector}] ${ruleTest.name} - try ${attemp}`);
            }

            try {
                if (ruleTest.before) {
                    await ruleTest.before(t);
                }

                const hintConfig = createConfig(ruleId, 'local', configs);
                const resources = resourceLoader.loadResources(hintConfig);
                const engine = new Engine(hintConfig, resources);

                const results = await engine.executeOn(getAsUri(ruleTest.path));

                await engine.close();

                if (ruleTest.after) {
                    await ruleTest.after(t);
                }

                return validateResults(t, results, ruleTest.reports);
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

    ruleTests.forEach((ruleTest) => {
        runner(`[local] ${ruleTest.name}`, runRule, ruleTest, 'local');
    });
};
