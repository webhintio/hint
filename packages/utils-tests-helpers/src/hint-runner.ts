/**
 * @fileoverview Allows to tests hints individually creating a server.
 */

import { URL } from 'url';
import * as proxyquire from 'proxyquire';

import anyTest, { TestFn, ExecutionContext } from 'ava';

import { IServer, Server } from '@hint/utils-create-server';
import { readFileAsync } from '@hint/utils-fs';
import { asPathString, getAsUri, requestAsync } from '@hint/utils-network';
import { HintsConfigObject } from '@hint/utils';
import { Configuration, Engine, IHintConstructor, utils } from 'hint';
import { Problem, ProblemLocation, Severity } from '@hint/utils-types';

import { HintTest, HintLocalTest, Report, MatchProblemLocation } from './hint-test-type';

const { resourceLoader } = utils;
const connectors = [
    'puppeteer',
    'jsdom'
];

type HintRunnerContext = {
    server: IServer;
};

const test = anyTest as TestFn<HintRunnerContext>;

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
 * Compares two location to see if they have the same start/end values
 */
export const comparePositions = (position1: ProblemLocation, position2: ProblemLocation): boolean => {
    if (position1.line !== position2.line) {
        return false;
    }
    if (position1.column !== position2.column) {
        return false;
    }
    if (position1.endLine !== position2.endLine) {
        return false;
    }
    if (position1.endColumn !== position2.endColumn) {
        return false;
    }

    return true;
};

/**
 * Translates line and column start and end values to offset values.
 */
export const positionToOffset = (position: ProblemLocation, document: string): number[] => {
    const {column, endColumn, endLine, line} = position;

    if (typeof endLine !== 'number' || typeof endColumn !== 'number') {
        return [-1, -1];
    }
    let startOffset = column;
    let endOffset = endColumn;

    const regex = /(\r\n|\r|\n)/gm;

    for (let i = 0; i < endLine && regex.exec(document); i++) {
        const curLineOffset = regex.lastIndex || -1;

        if (i === line - 1) {
            startOffset = curLineOffset + column;
        }

        if (i === endLine - 1) {
            endOffset = curLineOffset + endColumn;
        }
    }

    return [startOffset, endOffset];
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
        return await requestAsync(url, {
            rejectUnauthorized: false,
            strictSSL: false
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
    const severity: Severity = opts?.severity ?? 'default';

    if (opts && opts.hintOptions) {
        hints[id] = [severity, opts.hintOptions];
    } else {
        hints[id] = severity;
    }

    // Allow all URLs in tests (to avoid localhost being ignored).
    if (!opts.ignoredUrls) {
        const meta = require(id).default.meta;

        opts.ignoredUrls = [{ domain: '.^', hints: [meta.id] }];
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
            if (typeof report.message === 'string') {
                report.message = report.message.replace(localhostRegex, `$1://localhost:${server.port}/`);
            }
        });
    }

    const reportsCopy = reports.slice(0);

    results.forEach((result) => {
        /**
         * To validate a result is valid we do a "filtered approach" instead of trying to match
         * all in one go so the error messages can help debug issues easier by reporting the
         * information to the report that matches the closest.
         */

        const { documentation, fixes, location, message, resource, severity } = result;

        const filteredByMessage = reportsCopy.filter((report) => {
            if (typeof report.message === 'string') {
                return report.message === message;
            }

            return report.message.test(message);
        });

        if (filteredByMessage.length === 0) {
            t.fail(`No reports match "${message}"`);

            return;
        }

        const filteredByDocumentationCount = filteredByMessage.filter((report) => {
            /*
             * If the report from the test doesn't ask for documentation,
             * we don't need to match it.
             */
            if (!report.documentation) {
                return true;
            }

            /*
             * If the report from the test does ask for documentation
             * but the result doesn't provide it, then it isn't a match.
             */
            if (!documentation) {
                return false;
            }

            return report.documentation.length === documentation.length;
        });

        if (filteredByDocumentationCount.length === 0) {
            t.fail(`No report has ${documentation?.length} documentation links`);

            return;
        }

        const filteredByDocumentation = filteredByMessage.filter((report) => {
            /*
             * If the report from the test doesn't ask for documentation,
             * we don't need to macth it.
             */
            if (!report.documentation) {
                return true;
            }

            /*
             * If the report from the test does ask for documentation
             * but the result doesn't provide it, then it isn't a match.
             */
            if (!documentation) {
                return false;
            }

            const every = documentation.every((docResult) => {
                const some = report.documentation?.some((docReport) => {
                    return docReport.link === docResult.link &&
                        docReport.text === docResult.text;
                });

                return some;
            });

            return every;
        });

        if (filteredByDocumentation.length === 0) {
            const failStringArray = result.documentation?.map((doc) => {
                return `No reports match documentation "${doc.text}" with link "${doc.link}"`;
            });

            t.fail(failStringArray?.join('\n'));

            return;
        }

        const filteredByPosition = filteredByDocumentation.filter((report) => {
            /*
             * If the report from the test doesn't ask for position,
             * we don't need to macth it.
             */
            if (!report.position) {
                return true;
            }

            /*
             * If the report from the test does ask for location
             * but the result doesn't provide it, then it isn't a match.
             */
            if (!location) {
                return false;
            }

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

        const filteredByFixes = filteredByPosition.filter((report) => {
            /*
             * If the report from the test doesn't ask for fixes,
             * we don't need to match it.
             */
            if (!report.fixes) {
                return true;
            }

            /*
             * If the report from the test does ask for fixes
             * but the result doesn't provide it, then it isn't a match.
             */
            if (!fixes) {
                return false;
            }

            if (Array.isArray(report.fixes)) {
                if (report.fixes.length !== fixes.length) {
                    return false;
                }

                for (let i = 0; i < fixes.length; i++) {
                    const curLocation = fixes[i].location;
                    const curText = fixes[i].text;
                    const targetLocation = report.fixes[i].location;
                    const targetText = report.fixes[i].text;

                    if (curText !== targetText || !comparePositions(curLocation, targetLocation)) {
                        return false;
                    }
                }

                return true;
            } else if (report.fixes.match) {
                let sourceCopy = sources.get(resource);

                if (!sourceCopy) {
                    return false;
                }

                /**
                 *  We want to sort fixes starting from the end of the document moving upwards to avoid one fix changing the offset of a subsequent fix.
                 */
                fixes.sort((a, b) => {
                    const lineDiff = b.location.line - a.location.line;

                    if (lineDiff === 0) {
                        return b.location.column - a.location.column;
                    }

                    return lineDiff;
                });

                for (const fix of fixes) {
                    let startOffset = fix.location.startOffset;
                    let endOffset = fix.location.endOffset;


                    if (!startOffset || !endOffset) {
                        const document = sources.get(resource);

                        if (document) {
                            [startOffset, endOffset] = positionToOffset(fix.location, document);
                            if (startOffset < 0 || endOffset < 0) {
                                return false;
                            }
                        } else {
                            return false;
                        }
                    }

                    sourceCopy = sourceCopy.substring(0, startOffset) + fix.text + sourceCopy.substring(endOffset);
                }
                t.is(sourceCopy, report.fixes.match);

                return sourceCopy === report.fixes.match;
            }

            return false;
        });

        if (filteredByFixes.length === 0) {
            t.fail(`The fix ${JSON.stringify(fixes)} does not match any report for "${message}"`);
        }

        const filteredBySeverity = filteredByFixes.filter((report) => {
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

        if (hintTest.overrides) {
            resources.hints = [proxyquire(hintId, hintTest.overrides).default];
        }

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
            const err = e as Error;

            console.error(err);

            if (server) {
                await server.stop();
            }

            if (engine) {
                await engine.close();
            }

            return t.fail(`${hintTest.name} throwed an exception:\n${err.message}\n${err.stack}`);
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

            if (hintTest.overrides) {
                resources.hints = [proxyquire(hintId, hintTest.overrides).default];
            }

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
            const err = e as Error;

            console.error(err);

            return t.fail(`${hintTest.name} throwed an exception:\n${err.message}\n${err.stack}`);
        }
    };

    hintTests.forEach((hintTest) => {
        runner(`[local] ${hintTest.name}`, runHint, hintTest, connector);
    });
};
