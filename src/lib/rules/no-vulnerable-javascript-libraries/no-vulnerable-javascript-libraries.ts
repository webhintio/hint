/**
 * @fileoverview This rule checks if the site is running any vulnerable library using https://snyk.io database
 */
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

import { groupBy } from 'lodash';
import * as pluralize from 'pluralize';
import * as request from 'request';
import * as semver from 'semver';

import { Category } from '../../enums/category';
import * as logger from '../../utils/logging';
import { readFileAsync } from '../../utils/misc';
import { debug as d } from '../../utils/debug';
import { IRule, IRuleBuilder, IScanEnd, Library, Vulnerability } from '../../types';
import { RuleContext } from '../../rule-context';

const debug = d(__filename);

// ------------------------------------------------------------------------------
// Public
// ------------------------------------------------------------------------------

const rule: IRuleBuilder = {
    create(context: RuleContext): IRule {
        let minimumSeverity = 'low';

        /** Creates the script that will be injected in the connector to detect what libraries are run
         * using [`js-library-detector`](https://npmjs.com/package/js-library-detector). */
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
            let needsUpdate = false;
            let snykStat: fs.Stats;

            // We check if the file is older than 24h to update it
            try {
                snykStat = await promisify(fs.stat)(snykDBPath);
                const modified = new Date(snykStat.mtime).getTime();

                if (now - modified > oneDay) {
                    debug('snkyDB is older than 24h.');
                    needsUpdate = true;
                }
            } catch (e) {
                // There was a problem loading the file --> download
                needsUpdate = true;
            }

            if (needsUpdate) {
                try {
                    debug('Updating snykDB');
                    const res: request.RequestResponse = await promisify(request)({ url: 'https://snyk.io/partners/api/v2/vulndb/clientside.json' });

                    await promisify(fs.writeFile)(snykDBPath, res.body, 'utf-8');
                } catch (e) {
                    // Problem downloading the remote resource --> use local copy
                }
            }

            return JSON.parse(await readFileAsync(snykDBPath));
        };

        /** If a used library has vulnerability that meets the minimum threshold, it gets reported.  */
        const reportLibrary = async (library: Library, vulns: Array<Vulnerability>, resource: string) => {
            let vulnerabilities = vulns;

            if (minimumSeverity !== 'low') {
                debug('Filtering vulnerabilities');
                vulnerabilities = vulnerabilities.filter((vulnerability) => {
                    const { severity } = vulnerability;
                    let passes = false;

                    switch (minimumSeverity) {
                        case 'medium':
                            passes = severity === 'medium' || severity === 'high';
                            break;
                        case 'high':
                            passes = severity === 'high';
                            break;
                        default: break;
                    }

                    return passes;
                });
            }

            if (vulnerabilities.length === 0) {
                return;
            }

            const vulnerabilitiesBySeverity = groupBy(vulnerabilities, 'severity');
            const link = `https://snyk.io/vuln/${vulnerabilities[0].packageManager}:${vulnerabilities[0].packageName}`;
            const detail = Object.entries(vulnerabilitiesBySeverity).map(([severity, entries]) => {
                return `${entries.length} ${severity}`;
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
            const detectedLibraries = (await context.evaluate(script)) as Array<Library>;

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
        recommended: true,
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
        worksWithLocalFiles: false
    }
};

module.exports = rule;
