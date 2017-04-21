/**
 * @fileoverview Allows to tests rules individually creating a server.
 */

import * as url from 'url';

import { test, ContextualTestContext } from 'ava'; // eslint-disable-line no-unused-vars
import * as retry from 'async-retry';

import { createServer } from './test-server';
import { IElementFoundEvent, INetworkData, IRule, IRuleBuilder } from '../../src/lib/types'; // eslint-disable-line no-unused-vars
import { RuleTest } from './rule-test-type'; // eslint-disable-line no-unused-vars
import * as Sonar from '../../src/lib/sonar';

/** Executes all the tests from `ruleTests` in the rule whose id is `ruleId` */
export const testRule = (ruleId: string, ruleTests: Array<RuleTest>, options?: object) => {

    const collectors = ['jsdom', 'cdp'];

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

    /** Runs a test for the rule being tested */
    const runRule = (t: ContextualTestContext, ruleTest: RuleTest, collector: string) => {
        return retry(async (bail, attemp) => {
            if (attemp > 1) {
                console.log(`[${collector}]${ruleTest.name} - try ${attemp}`);
            }

            const { server } = t.context;
            const { serverConfig, reports } = ruleTest;
            const sonar: Sonar.Sonar = await Sonar.create(createConfig(ruleId, collector, options));

            // We need to configure it later because we don't know the port until the server starts
            server.configure(serverConfig);

            const results = await sonar.executeOn(url.parse(`http://localhost:${server.port}/`));

            await sonar.close();

            if (!reports) {
                return t.is(results.length, 0);
            }

            if (results.length === 0) {
                return t.fail(`No results found, should be ${reports.length}`);
            }

            if (results.length !== reports.length) {
                return t.fail(`Wrong number of results "${results.length}", should be ${reports.length}`);
            }

            return reports.forEach((report, index) => {
                t.is(results[index].message, report.message, `Different message`);
                if (report.position) {
                    t.is(results[index].column, report.position.column, `Different column`);
                    t.is(results[index].line, report.position.line, `Different line`);
                }
            });
        });
    };

    /* Run all the tests for a given rule in all collectors. */
    collectors.forEach((collector) => {
        ruleTests.forEach((ruleTest) => {
            test(`[${collector}]${ruleTest.name}`, runRule, ruleTest, collector);
        });
    });
};
