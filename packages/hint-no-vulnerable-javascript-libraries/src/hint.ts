/**
 * @fileoverview This hint checks if the site is running any vulnerable library using https://snyk.io database
 */
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

import { groupBy } from 'lodash';
import * as semver from 'semver';

import { Category } from 'hint/dist/src/lib/enums/category';
import * as logger from 'hint/dist/src/lib/utils/logging';
import { debug as d } from 'hint/dist/src/lib/utils/debug';
import { IHint, CanEvaluateScript, Severity, HintMetadata } from 'hint/dist/src/lib/types';
import { Library, Vulnerability } from './types';

import loadJSONFile from 'hint/dist/src/lib/utils/fs/load-json-file';
import readFileAsync from 'hint/dist/src/lib/utils/fs/read-file-async';
import writeFileAsync from 'hint/dist/src/lib/utils/fs/write-file-async';
import requestAsync from 'hint/dist/src/lib/utils/network/request-async';

import { HintContext } from 'hint/dist/src/lib/hint-context';
import { HintScope } from 'hint/dist/src/lib/enums/hintscope';

const debug = d(__filename);

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

export default class NoVulnerableJavascriptLibrariesHint implements IHint {

    public static readonly meta: HintMetadata = {
        docs: {
            category: Category.security,
            description: `This hint checks if the site is running any vulnerable library using https://snyk.io database`
        },
        id: 'no-vulnerable-javascript-libraries',
        schema: [{
            additionalProperties: false,
            properties: {
                severity: {
                    pattern: '^(low|medium|high)$',
                    type: 'string'
                }
            },
            type: 'object'
        }],
        /*
         * Snyk can not analize a file itself, it needs a connector.
         * TODO: Change to any once the local connector has jsdom.
         */
        scope: HintScope.site
    }

    public constructor(context: HintContext) {

        let minimumSeverity = 'low';

        /**
         * Creates the script that will be injected in the connector to detect what libraries are run
         * using [`js-library-detector`](https://npmjs.com/package/js-library-detector).
         */
        const createScript = async (): Promise<string> => {
            debug('Creating script to inject');
            const libraryDetector = await readFileAsync(require.resolve('js-library-detector/library/libraries.js'));

            const script = `(function (){
                ${libraryDetector};

                const libraries = Object.entries(d41d8cd98f00b204e9800998ecf8427e_LibraryDetectorTests);
                const detectedLibraries = libraries.reduce((detected, [name, lib]) => {
                    try {
                        const result = lib.test(window);
                        if (result) {
                            detected.push({
                                name,
                                version: result.version,
                                npmPkgName: lib.npm
                            });
                        }
                    }
                    catch (e) {}

                    return detected;
                }, []);

                return detectedLibraries;
            }())`;

            return script;
        };

        /** Loads the local copy of the snyk database and updates it if the file is older than 24h. */
        const loadSnyk = async () => {
            const oneDay = 3600000 * 24;
            const now = Date.now();
            const snykDBPath = path.join(__dirname, 'snyk-snapshot.json');
            let snykStat: fs.Stats;

            try {
                snykStat = await promisify(fs.stat)(snykDBPath);
                const modified = new Date(snykStat.mtime).getTime();

                // We check if the file is older than 24h to update it
                if (now - modified > oneDay) {
                    debug('snkyDB is older than 24h.');
                    debug('Updating snykDB');
                    const res = await requestAsync('https://snyk.io/partners/api/v2/vulndb/clientside.json');

                    await writeFileAsync(snykDBPath, res);
                }
            } catch (e) {
                debug(e);
                debug(`Error loading snyk's data`);
            }

            return loadJSONFile(snykDBPath);
        };

        /** If a used library has vulnerability that meets the minimum threshold, it gets reported.  */
        const reportLibrary = async (library: Library, vulns: Array<Vulnerability>, resource: string) => {
            let vulnerabilities = vulns;


            debug('Filtering vulnerabilities');
            vulnerabilities = vulnerabilities.filter((vulnerability) => {
                const { severity } = vulnerability;
                let fails = false;

                switch (minimumSeverity) {
                    case 'medium':
                        fails = severity === 'medium' || severity === 'high';
                        break;
                    case 'high':
                        fails = severity === 'high';
                        break;
                    // priority is low, so everything needs to be reported
                    default:
                        fails = true;
                        break;
                }

                return fails;
            });


            if (vulnerabilities.length === 0) {
                return;
            }

            const vulnerabilitiesBySeverity = groupBy(vulnerabilities, 'severity');
            const link = `https://snyk.io/vuln/${vulnerabilities[0].packageManager}:${vulnerabilities[0].packageName}`;
            const detail = Object.entries(vulnerabilitiesBySeverity).map(([severity, entries]) => {
                return `${(entries as any[]).length} ${severity}`;
            })
                .join(', ');

            if (detail) {
                await context.report(resource, null, `${library.name}@${library.version} has ${vulnerabilities.length} known ${vulnerabilities.length === 1 ? 'vulnerability' : 'vulnerabilities'} (${detail}). See ${link} for more information.`);
            }
        };

        /** Removes any tags from a version. E.g.: 2.0.0rc --> 2.0.0, 2.0.1-pre --> 2.0.1 */
        const removeTagsFromVersion = (version: string): string => {
            const match = (/(\d+\.?)+/).exec(version);

            return match && match[0];
        };

        /** Given a list of libraries, reports the ones that have known vulnerabilities. */
        const detectAndReportVulnerableLibraries = async (libraries: Array<Library>, resource: string) => {
            // TODO: Check if snykDB is older than 24h and download if so. If not, or if itfails, use local version
            const snykDB = await loadSnyk();

            for (const lib of libraries) {
                const snykInfo = snykDB.npm[lib.npmPkgName] as Array<Vulnerability>;

                // No npm package that snyk could check
                if (!snykInfo) {
                    continue;
                }

                const vulnerabilities: Array<Vulnerability> = snykInfo.reduce((vulns, vuln) => {
                    const version = removeTagsFromVersion(lib.version);

                    try {
                        if (semver.satisfies(version, vuln.semver.vulnerable[0])) {
                            vulns.push(vuln);
                        }
                    } catch (e) {
                        logger.error(`Version ${version} of ${lib.name} isn't semver compliant`);
                    }

                    return vulns;
                }, []);

                await reportLibrary(lib, vulnerabilities, resource);
            }
        };

        /** Checks if the JS libraries used by a website have known vulnerabilities. */
        const validateLibraries = async (canEvaluateScript: CanEvaluateScript) => {
            const script = await createScript();
            const resource = canEvaluateScript.resource;
            let detectedLibraries;

            try {
                detectedLibraries = (await context.evaluate(script)) as Array<Library>;
            } catch (e) {
                await context.report(resource, null, `Error executing script: "${e.message}". Please try with another connector`, null, null, Severity.warning);
                debug('Error executing script', e);

                return;
            }

            // No libraries detected, nothing to report
            if (detectedLibraries.length === 0) {
                return;
            }

            await detectAndReportVulnerableLibraries(detectedLibraries, canEvaluateScript.resource);

            return;
        };

        minimumSeverity = (context.hintOptions && context.hintOptions.severity) || 'low';

        context.on('can-evaluate::script', validateLibraries);
    }
}
