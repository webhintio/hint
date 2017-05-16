/**
 * @fileoverview Allows to tests rules individually creating a server.
 */

import * as url from 'url';

import { test } from 'ava'; // eslint-disable-line no-unused-vars
import * as retry from 'async-retry';

import { ids as collectors } from './collectors';
import { createServer } from './test-server';
import { IElementFoundEvent, INetworkData, IRule, IRuleBuilder } from '../../src/lib/types'; // eslint-disable-line no-unused-vars
import { RuleTest } from './rule-test-type'; // eslint-disable-line no-unused-vars
import * as Sonar from '../../src/lib/sonar';

/** Executes all the tests from `ruleTests` in the rule whose id is `ruleId` */
export const testRule = (ruleId: string, ruleTests: Array<RuleTest>, collectorOptions?, serial: boolean = false) => {

    /** Creates a valid sonar configuration. Eventually we should
     * test all available collectors and not only JSDOM */
    const createConfig = (id: string, collector: string, opts?) => {
        const rules = {};

        if (!opts) {
            rules[id] = 'error';
        } else {
            rules[id] = ['error', opts];
        }

        return {
            collector: { name: collector },
            rules
        };
    };

    /** Because tests are executed asynchronously in ava, we need
     * a different server and sonar object for each one */
    test.beforeEach(async (t) => {
        t.context.server = createServer();
        await t.context.server.start();
    });

    test.afterEach((t) => {
        t.context.server.stop();
    });

    /** Validates that the results from the execution match the expected ones. */
    const validateResults = (t, results, reports) => {
        const { server } = t.context;

        if (!reports) {
            return t.is(results.length, 0);
        }

        if (results.length === 0) {
            return t.fail(`No results found, should be ${reports.length}`);
        }

        if (results.length !== reports.length) {
            return t.fail(`Result count is ${results.length}, should be ${reports.length}`);
        }

        return reports.forEach((report, index) => {
            t.is(results[index].message, report.message.replace(/http:\/\/localhost\//g, `http://localhost:${server.port}/`), `Different message`);

            if (report.position) {
                t.is(results[index].column, report.position.column, `Different column`);
                t.is(results[index].line, report.position.line, `Different line`);
            }
        });
    };

    /** Creates a new collector with just the rule to be tested and executing
     * any required `before` task as indicated by `ruleTest`. */
    const createCollector = async (t, ruleTest: RuleTest, collector: string, attemp: number): Promise<Sonar.Sonar> => {
        const { server } = t.context;
        const { serverConfig } = ruleTest;

        if (ruleTest.before) {
            await ruleTest.before();
        }

        const sonar: Sonar.Sonar = await Sonar.create(createConfig(ruleId, collector, collectorOptions));

        // We only configure the server the first time
        if (attemp === 1 && serverConfig) {
            server.configure(serverConfig);
        }

        return sonar;
    };

    /** Stops a collector executing any required `after` task as indicated by
     * `ruleTest`. */
    const stopCollector = async (ruleTest: RuleTest, collector): Promise<void> => {
        if (ruleTest.after) {
            await ruleTest.after();
        }

        await collector.close();
    };

    /** Runs a test for the rule being tested */
    const runRule = (t, ruleTest: RuleTest, collector: string) => {
        return retry(async (bail, attemp) => {
            if (attemp > 1) {
                console.log(`[${collector}]${ruleTest.name} - try ${attemp}`);
            }

            const { server } = t.context;
            const { serverUrl, reports } = ruleTest;
            const target = serverUrl ? serverUrl : `http://localhost:${server.port}/`;

            const sonar = await createCollector(t, ruleTest, collector, attemp);
            const results = await sonar.executeOn(url.parse(target));

            await stopCollector(ruleTest, sonar);

            return validateResults(t, results, reports);
        },
            {
                minTimeout: 10000,
                retries: 3
            });
    };

    /* Run all the tests for a given rule in all collectors. */
    collectors.forEach((collector) => {
        ruleTests.forEach((ruleTest) => {
            const runner = serial ? test.serial : test;

            runner(`[${collector}]${ruleTest.name}`, runRule, ruleTest, collector);
        });
    });
};
