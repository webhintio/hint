/**
 * @fileoverview Allows to tests hints individually creating a server.
 */

import { URL } from 'url';

import anyTest, { TestInterface, ExecutionContext } from 'ava';

import { Server } from '@hint/utils-create-server';
import { fs, network } from '@hint/utils';

import { Configuration, Engine, HintsConfigObject, IHintConstructor, Problem, ProblemLocation, utils } from 'hint';

import { ids as connectors } from './connectors';
import { HintTest, HintLocalTest, Report } from './hint-test-type';

const { resourceLoader } = utils;
const { readFileAsync } = fs;
const { asPathString, getAsUri, requestAsync } = network;

type HintRunnerContext = {
    server: Server;
};

const test = anyTest as TestInterface<HintRunnerContext>;

// Regex to replace all scenarios: `http(s)://localhost/`, `http(s)://localhost:3000/`
const localhostRegex = /(http|https):\/\/localhost[:]*[0-9]*\//g;

/**
 * Determines which parsers to use based on provided options,
 * but always including 'html' (so individual tests don't have to).
 */
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
const findPosition = (source: string, match: string): ProblemLocation => {
    const lines = source.split('\n');
    const index = source.indexOf(match);

    let line = 0;
    let column = index;

    while (line < lines.length && column >= lines[line].length) {
        column -= (lines[line].length + 1);
        line++;
    }

    return {
        column,
        line
    };
};

/**
 * Get the source code for the provided resource.
 * Returns the empty string if resource was invalid.
 */
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
        ignoredUrls: opts.ignoredUrls,
        parsers: determineParsers(opts && opts.parsers)
    };

    // Allow us to use our self-signed cert for testing.
    config.connector.options = { ignoreHTTPSErrors: true };

    return Configuration.fromConfig(config);
};

/** Validates that the results from the execution match the expected ones. */
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
        const { location, message, resource } = result;
        let index = 0;

        const found = reportsCopy.some((report, i) => {
            index = i;

            if (report.message !== message) {
                return false;
            }

            if (report.position && location) {
                const position = 'match' in report.position ?
                    findPosition(sources.get(resource) || '', report.position.match) :
                    report.position;

                return position.column === location.column &&
                    position.line === location.line;
            }

            return true;
        });

        if (found) {
            reportsCopy.splice(index, 1);
        }

        t.true(found, `No reports match "${message}" or its location (${JSON.stringify(location)}).`);
    });
};

/** Executes all the tests from `hintTests` in the hint whose id is `hintId` */
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
