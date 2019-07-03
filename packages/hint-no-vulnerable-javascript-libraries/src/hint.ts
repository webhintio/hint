/**
 * @fileoverview This hint checks if the site is running any vulnerable library using https://snyk.io database
 */
import * as fs from 'fs';
import { promisify } from 'util';

import groupBy = require('lodash/groupBy');
import * as semver from 'semver';

import { debug as d } from '@hint/utils/dist/src/debug';
import { readFileAsync } from '@hint/utils/dist/src/fs/read-file-async';
import { writeFileAsync } from '@hint/utils/dist/src/fs/write-file-async';
import * as logger from '@hint/utils/dist/src/logging';
import { requestAsync } from '@hint/utils/dist/src/network/request-async';

import { IHint, CanEvaluateScript, Severity } from 'hint/dist/src/lib/types';
import { Library, Vulnerability } from './types';

import { HintContext } from 'hint/dist/src/lib/hint-context';

import meta from './meta';
import { getMessage } from './i18n.import';

const debug = d(__filename);

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

export default class NoVulnerableJavascriptLibrariesHint implements IHint {

    public static readonly meta = meta;

    public constructor(context: HintContext) {

        let minimumSeverity = 'low';

        /**
         * Creates the script that will be injected in the connector to detect what libraries are run
         * using [`js-library-detector`](https://npmjs.com/package/js-library-detector).
         */
        const createScript = async (): Promise<string> => {
            debug('Creating script to inject');
            const libraryDetector = await readFileAsync(require.resolve('js-library-detector'));

            const script = `/*RunInPageContext*/
            (function (){
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

            /*
             * If webpack is true, we are in the browser
             * extension and we don't need to download a
             * new file.
             */
            /* istanbul ignore if */
            if (process.env.webpack) { // eslint-disable-line no-process-env
                return require('./snyk-snapshot.json');
            }

            try {
                const snykDBPath = require.resolve('./snyk-snapshot.json');
                const snykStat = await promisify(fs.stat)(snykDBPath);
                const modified = new Date(snykStat.mtime).getTime();

                // We check if the file is older than 24h to update it
                /* istanbul ignore if */
                if (now - modified > oneDay) {
                    debug('snkyDB is older than 24h.');
                    debug('Updating snykDB');
                    const res = await requestAsync('https://snyk.io/partners/api/v2/vulndb/clientside.json');

                    await writeFileAsync(snykDBPath, res);
                }
            } catch (e) /* istanbul ignore next */ {
                debug(e);
                debug(`Error loading snyk's data`);
            }

            return require('./snyk-snapshot.json');
        };

        /** If a used library has vulnerability that meets the minimum threshold, it gets reported.  */
        const reportLibrary = (library: Library, vulns: Vulnerability[], resource: string) => {
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
                let message: string;

                if (vulnerabilities.length === 1) {
                    message = getMessage('vulnerability', context.language, [library.name, library.version, vulnerabilities.length.toString(), detail, link]);
                } else {
                    message = getMessage('vulnerabilities', context.language, [library.name, library.version, vulnerabilities.length.toString(), detail, link]);
                }

                context.report(resource, message);
            }
        };

        /** Removes any tags from a version. E.g.: 2.0.0rc --> 2.0.0, 2.0.1-pre --> 2.0.1 */
        const removeTagsFromVersion = (version: string): string | null => {
            const match = (/(\d+\.?)+/).exec(version);

            return match && match[0];
        };

        /** Given a list of libraries, reports the ones that have known vulnerabilities. */
        const detectAndReportVulnerableLibraries = async (libraries: Library[], resource: string) => {
            // TODO: Check if snykDB is older than 24h and download if so. If not, or if itfails, use local version
            const snykDB = await loadSnyk();

            for (const lib of libraries) {
                const snykInfo = snykDB.npm[lib.npmPkgName] as Vulnerability[];

                // No npm package that snyk could check
                if (!snykInfo) {
                    continue;
                }

                const vulnerabilities: Vulnerability[] = snykInfo.reduce((vulns, vuln) => {
                    const version = removeTagsFromVersion(lib.version) /* istanbul ignore next */ || '';

                    try {
                        vuln.semver.vulnerable.forEach((vulnVersion: string) => {
                            if (semver.satisfies(version, vulnVersion)) {
                                vulns.push(vuln);
                            }
                        });
                    } catch (e) {
                        logger.error(getMessage('versionNotCompliant', context.language, [version, lib.name]));
                    }

                    return vulns;
                }, [] as Vulnerability[]);

                reportLibrary(lib, vulnerabilities, resource);
            }
        };

        /** Checks if the JS libraries used by a website have known vulnerabilities. */
        const validateLibraries = async (canEvaluateScript: CanEvaluateScript) => {
            const script = await createScript();
            const resource = canEvaluateScript.resource;
            let detectedLibraries;

            try {
                detectedLibraries = (await context.evaluate(script)) as Library[];
            } catch (e) {
                let message: string;

                if (e.message.includes('evaluation exceeded')) {
                    message = getMessage('notFastEnough', context.language);
                } else {
                    message = getMessage('errorExecuting', context.language, e.message);
                }

                message = getMessage('tryAgainLater', context.language, message);

                context.report(resource, message, { severity: Severity.warning });
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
