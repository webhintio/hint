/**
 * @fileoverview Allows to tests rules individually creating a server.
 */

import * as url from 'url';

import { test, ContextualTestContext } from 'ava'; // eslint-disable-line no-unused-vars

import { createServer } from './test-server';
import { IElementFoundEvent, INetworkData, IRule, IRuleBuilder } from '../../src/lib/types'; // eslint-disable-line no-unused-vars
import { RuleTest } from './rule-test-type'; // eslint-disable-line no-unused-vars
import * as Sonar from '../../src/lib/sonar';

/** Executes all the tests from `ruleTests` in the rule whose id is `ruleId` */
export const testRule = (ruleId: string, ruleTests: Array<RuleTest>, options?: object) => {

    /** Creates a valid sonar configuration. Eventually we should
     * test all available collectors and not only JSDOM */
    const createConfig = (id, opts?) => {
        const rules = {};

        if (!opts) {
            rules[id] = 'error';
        } else {
            rules[id] = ['error', opts];
        }

        return {
            collector: { name: 'jsdom' },
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
    const runRule = async (t: ContextualTestContext, ruleTest: RuleTest) => {
        const { server } = t.context;
        const { reports } = ruleTest;
        const sonar: Sonar.Sonar = await Sonar.create(createConfig(ruleId, options));

        // We need to configure it later because we don't know the port until the server starts
        server.configure(ruleTest.serverConfig);

        const results = await sonar.executeOn(url.parse(`http://localhost:${server.port}/`));

        sonar.close();

        if (!reports) {
            return t.is(results.length, 0);
        }

        t.is(results.length, reports.length, `(${ruleTest.name}) The number of issues found is ${results.length} (should be ${reports.length})`);

        return reports.forEach((report, index) => {
            t.is(results[index].message, report.message, `(${ruleTest.name}) different message`);
            if (report.position) {
                t.is(results[index].column, report.position.column, `(${ruleTest.name}) different column`);
                t.is(results[index].line, report.position.line, `(${ruleTest.name}) different line`);
            }
        });
    };

    /** Runs all the tests for a given rule */
    ruleTests.forEach((ruleTest) => {
        test(ruleTest.name, runRule, ruleTest);
    });
};
