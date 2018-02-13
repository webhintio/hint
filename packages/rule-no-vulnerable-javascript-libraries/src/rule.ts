/**
 * @fileoverview This rule checks if the site is running any vulnerable library using https://snyk.io database
 */
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

import * as groupBy from 'lodash.groupby';
import * as pluralize from 'pluralize';
import * as semver from 'semver';

import { Category } from 'sonarwhal/dist/src/lib/enums/category';
import * as logger from 'sonarwhal/dist/src/lib/utils/logging';
import { debug as d } from 'sonarwhal/dist/src/lib/utils/debug';
import { IRule, IRuleBuilder, IScanEnd, Severity } from 'sonarwhal/dist/src/lib/types';
import { Library, Vulnerability } from './rule-types';
import { readFileAsync, loadJSONFile, requestAsync, writeFileAsync } from 'sonarwhal/dist/src/lib/utils/misc';
import { RuleContext } from 'sonarwhal/dist/src/lib/rule-context';
import { RuleScope } from 'sonarwhal/dist/src/lib/enums/rulescope';

const debug = d(__filename);

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

const rule: IRuleBuilder = {
    create(context: RuleContext): IRule {
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
                await context.report(resource, null, `${library.name}@${library.version} has ${vulnerabilities.length} known ${pluralize('vulnerability', vulnerabilities)} (${detail}). See ${link} for more information.`);
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
        const validateLibraries = async (scanEnd: IScanEnd) => {
            const script = await createScript();
            const resource = scanEnd.resource;
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

            await detectAndReportVulnerableLibraries(detectedLibraries, scanEnd.resource);

            return;
        };

        minimumSeverity = (context.ruleOptions && context.ruleOptions.severity) || 'low';

        return { 'scan::end': validateLibraries };
    },
    meta: {
        docs: {
            category: Category.security,
            description: `This rule checks if the site is running any vulnerable library using https://snyk.io database`
        },
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
        scope: RuleScope.site
    }
};

module.exports = rule;
