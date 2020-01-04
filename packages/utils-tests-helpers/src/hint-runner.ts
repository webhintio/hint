/**
 * @fileoverview Allows to tests hints individually creating a server.
 */

import { URL } from 'url';

import anyTest, { TestInterface, ExecutionContext } from 'ava';

import { IServer, Server } from '@hint/utils-create-server';
import { readFileAsync } from '@hint/utils-fs';
import { asPathString, getAsUri, requestAsync } from '@hint/utils-network';
import { HintsConfigObject } from '@hint/utils';
import { Configuration, Engine, IHintConstructor, utils } from 'hint';
import { Problem, ProblemLocation } from '@hint/utils-types';

import { HintTest, HintLocalTest, Report, MatchProblemLocation } from './hint-test-type';

const { resourceLoader } = utils;
const connectors = [
    'puppeteer',
    'jsdom'
];

type HintRunnerContext = {
    server: IServer;
};

const test = anyTest as TestInterface<HintRunnerContext>;

// Regex to replace all scenarios: `http(s)://localhost/`, `http(s)://localhost:3000/`
const localhostRegex = /(http|https):\/\/localhost[:]*[0-9]*\//g;

/**
 * Determines which parsers to use based on provided options,
 * but always including 'html' (so individual tests don't have to).
 */
/* istanbul ignore next */
const determineParsers = (parsers?: string[]) => {
    if (!parsers) {
        return ['html'];
    }

    return Array.from(new Set(['html', ...parsers]));
};

/**
 * Generates a ProblemLocation based on the index of the first occurance
 * of the provided substring.
 */
/* istanbul ignore next */
const findPosition = (source: string, position: MatchProblemLocation): ProblemLocation => {
    const { match, range } = position;
    const lines = source.split('\n');
    const index = source.indexOf(match);

    let line = 0;
    let column = index;

    while (line < lines.length && column >= lines[line].length) {
        column -= (lines[line].length + 1);
        line++;
    }

    const result: ProblemLocation = {
        column,
        line
    };

    if (range) {
        const lineText = lines[line];

        const rangeIndex = lineText.indexOf(range);

        result.endColumn = rangeIndex + range.length;
        result.endLine = line;
    }

    return result;
};

/**
 * Get the source code for the provided resource.
 * Returns the empty string if resource was invalid.
 */
/* istanbul ignore next */
const requestSource = async (url: string, connector: string): Promise<string> => {
    try {
        if (connector === 'local') {
            return await readFileAsync(asPathString(getAsUri(url)!));
        }

        /*
         * Allow us to use our self-signed cert for testing.
         * https://github.com/request/request/issues/418#issuecomment-23058601
         */
        return await requestAsync({
            rejectUnauthorized: false,
            strictSSL: false,
            url
        });
    } catch (e) {
        // Some tests deliberately use invalid URLs (e.g. `test:`).
        return '';
    }
};

/**
 * Creates a valid hint configuration.
 */
/* istanbul ignore next */
const createConfig = (id: string, connector: string, opts?: any): Configuration => {
    const hints: HintsConfigObject = {};

    if (opts && opts.hintOptions) {
        hints[id] = ['default', opts.hintOptions];
    } else {
        hints[id] = 'default';
    }

    const config = {
        browserslist: opts && opts.browserslist || [],
        connector: {
            name: connector,
            options: {}
        },
        hints,
        ignoredUrls: opts.ignoredUrls,
        parsers: determineParsers(opts && opts.parsers)
    };

    /**
     * Defaults needed to run the tests. All apply only to
     * `puppeteer` except `ignoreHTTPSErrors` that's common
     * to all.
     */
    config.connector.options = {
        detached: true,
        ignoreHTTPSErrors: true,
        puppeteerOptions: { timeout: 60000 },
        waitUntil: 'networkidle0'
    };

    return Configuration.fromConfig(config);
};

/** Validates that the results from the execution match the expected ones. */
/* istanbul ignore next */
const validateResults = (t: ExecutionContext<HintRunnerContext>, sources: Map<string, string>, results: Problem[], reports?: Report[]) => {
    const server = t.context.server || {};

    if (!reports) {
        t.is(results.length, 0, `Received results is ${JSON.stringify(results, null, 2)}`);

        return;
    }

    if (results.length === 0) {
        t.fail(`No results found, should be ${reports.length}`);

        return;
    }

    if (results.length !== reports.length) {
        t.fail(`Result count is ${results.length}, should be ${reports.length}`);

        return;
    }

    if (server.port) {
        reports.forEach((report) => {
            report.message = report.message.replace(localhostRegex, `$1://localhost:${server.port}/`);
        });
    }

    const reportsCopy = reports.slice(0);

    results.forEach((result) => {
        /**
         * To validate a result is valid we do a "filtered approach" instead of trying to match
         * all in one go so the error messages can help debug issues easier by reporting the
         * information to the report that matches the closest.
         */

        const { location, message, resource, severity } = result;

        const filteredByMessage = reportsCopy.filter((report) => {
            return report.message === message;
        });

        if (filteredByMessage.length === 0) {
            t.fail(`No reports match "${message}"`);

            return;
        }

        const filteredByPosition = filteredByMessage.filter((report) => {
            if (report.position && location) {
                let position: ProblemLocation | undefined;

                if ('match' in report.position) {
                    position = findPosition(sources.get(resource) || '', report.position);
                } else {
                    position = report.position;
                }

                return position.column === location.column &&
                    position.line === location.line &&
                    (!('range' in report.position) || (
                        position.endLine === location.endLine &&
                        position.endColumn === location.endColumn));
            }

            // Not all reports in the test have a location
            return true;
        });

        // Check error location
        if (filteredByPosition.length === 0) {
            if (filteredByMessage.length === 1) {
                /**
                 * If there was only one matching message previously, we can provide the full diff.
                 * We need to get the position again in case it was a `match`, otherwise the diff
                 * will just be between the content of `match` and `column/position` so not useful.
                 */
                const report = filteredByMessage[0];
                let position: ProblemLocation | undefined;

                if (report.position && 'match' in report.position) {
                    position = findPosition(sources.get(resource) || '', report.position);
                } else {
                    position = report.position;
                }

                t.is(JSON.stringify(position, null, 2), JSON.stringify(location, null, 2), `Location doesn't match for "${message}"`);
            } else {
                t.fail(`The location ${JSON.stringify(location)} does not match any report for "${message}"`);
            }

            return;
        }

        const filteredBySeverity = filteredByPosition.filter((report) => {
            // Not all reports in the test have a severity
            if (typeof report.severity === 'undefined') {
                return true;
            }

            return !(typeof report.severity !== 'undefined' && severity !== report.severity);
        });

        if (filteredBySeverity.length >= 1) {
            // message, location and severity match at least 1 report so the test passes
            t.pass();

            // There might be multiple equal reports, so we remove one of them to make sure we match all the occurrences
            for (let i = 0; i < reportsCopy.length; i++) {
                if (reportsCopy[i] === filteredBySeverity[0]) {
                    reportsCopy.splice(i, 1);
                }
            }

            return;
        }

        if (filteredByPosition.length === 1) {
            t.is(filteredByPosition[0].severity, severity, `Severities do not match for "${message}"`);
        } else {
            t.fail(`The severity "${severity}" does not match any report for "${message}"`);
        }
    });
};

/** Executes all the tests from `hintTests` in the hint whose id is `hintId` */
/* istanbul ignore next */
export const testHint = (hintId: string, hintTests: HintTest[], configs: { [key: string]: any } = {}) => {

    /**
     * Creates a new connector with only the hint to be tested and
     * executing any required `before` task as indicated by `hintTest`.
     */
    const createConnector = async (t: ExecutionContext<HintRunnerContext>, hintTest: HintTest, connector: string): Promise<Engine> => {
        if (hintTest.before) {
            await hintTest.before();
        }

        const config = createConfig(hintId, connector, configs);
        const resources = resourceLoader.loadResources(config);
        const engine: Engine = new Engine(config, resources);

        return engine;
    };

    /**
     * Stops a connector executing any required `after` task as indicated by
     * `hintTest`.
     */
    const stopConnector = async (hintTest: HintTest, engine: Engine): Promise<void> => {
        if (hintTest.after) {
            await hintTest.after();
        }

        await engine.close();
    };

    /** Runs a test for the hint being tested */
    const runHint = async (t: ExecutionContext<HintRunnerContext>, hintTest: HintTest, connector: string) => {
        let engine,
            server;

        try {
            server = await Server.create({ configuration: hintTest.serverConfig, isHTTPS: configs.https });

            const { serverUrl, reports } = hintTest;
            const target = serverUrl ? serverUrl : `${configs.https ? 'https' : 'http'}://localhost:${server.port}/`;

            engine = await createConnector(t, hintTest, connector);
            const results = await engine.executeOn(new URL(target));

            const sources = new Map<string, string>();

            for (const result of results) {
                if (!sources.has(result.resource)) {
                    sources.set(result.resource, await requestSource(result.resource, connector));
                }
            }

            await stopConnector(hintTest, engine);
            await server.stop();

            return validateResults(t, sources, results, Server.updateLocalhost(reports, server.port));
        } catch (e) {
            console.error(e);

            if (server) {
                await server.stop();
            }

            if (engine) {
                await engine.close();
            }

            return t.fail(`${hintTest.name} throwed an exception:\n${e.message}\n${e.stack}`);
        }
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

                if (hintTest.skip) {
                    runner = test.skip;
                } else {
                    runner = configs['serial'] ? test.serial : test; // eslint-disable-line dot-notation
                }

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

/* istanbul ignore next */
export const testLocalHint = (hintId: string, hintTests: HintLocalTest[], configs: { [key: string]: any } = {}) => {
    const Hint: IHintConstructor = resourceLoader.loadHint(hintId, []);
    const connector = 'local';

    if (Hint.meta.ignoredConnectors && Hint.meta.ignoredConnectors.includes(connector)) {
        return;
    }


    let runner: any;

    runner = configs.serial ? test.serial : test;

    /*
     * If the tests for a hint ignores the connector, then we
     * skip the tests
     */
    if (configs.ignoredConnectors && configs.ignoredConnectors.includes(connector)) {
        runner = test.skip;
    }

    /** Runs a test for the hint being tested */
    const runHint = async (t: ExecutionContext<HintRunnerContext>, hintTest: HintLocalTest) => {

        try {
            if (hintTest.before) {
                await hintTest.before(t);
            }

            const hintConfig = createConfig(hintId, connector, configs);
            const resources = resourceLoader.loadResources(hintConfig);
            const engine = new Engine(hintConfig, resources);

            // Can assume `getAsUri(hintTest.path)` is not `null` since these are controlled test inputs.
            const target = getAsUri(hintTest.path)!;
            const results = await engine.executeOn(target);

            await engine.close();

            if (hintTest.after) {
                await hintTest.after(t);
            }

            const sources = new Map<string, string>();

            for (const result of results) {
                if (!sources.has(result.resource)) {
                    sources.set(result.resource, await requestSource(result.resource, connector));
                }
            }

            return validateResults(t, sources, results, hintTest.reports);
        } catch (e) {
            console.error(e);

            return t.fail(`${hintTest.name} throwed an exception:\n${e.message}\n${e.stack}`);
        }
    };

    hintTests.forEach((hintTest) => {
        runner(`[local] ${hintTest.name}`, runHint, hintTest, connector);
    });
};
