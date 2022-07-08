/* eslint-disable multiline-comment-style */
/**
 * @fileoverview Hint to validate if the doctype is correct
 */

import * as os from 'os';

import { HintContext, IHint } from 'hint';
import { ProblemLocation, Severity } from '@hint/utils-types';
import { HTMLEvents, HTMLParse } from '@hint/parser-html';

import { MatchInformation } from './types';

import meta from './meta';
import { getMessage } from './i18n.import';

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

export default class implements IHint {

    public static readonly meta = meta;

    public constructor(context: HintContext<HTMLEvents>) {
        const correctLine = 0;
        const doctypeRegExp = new RegExp(`(<!doctype\\s+(html)\\s*>)(.+)?`, 'gi');
        const doctypeFlexibleRegExp = new RegExp(`<[^>]*doctype[^<]*>`, 'gi');

        const defaultProblemLocation: ProblemLocation = {
            column: 0,
            line: 0
        };

        const getCurrentDoctypeProblemLocation = (text: string): ProblemLocation[] => {
            const lines = text.split(os.EOL);
            const locations: ProblemLocation[] = [];

            lines.forEach((line: string, i: number): void => {
                const matched = doctypeRegExp.exec(line);

                if (matched) {
                    let endLine, endColumn;

                    const doctypeText = matched[1];

                    if (doctypeText) {
                        endColumn = matched.index;
                        endLine = i;

                        for (const letter of doctypeText) {
                            if (letter === '\n' || letter === '\r\n') {
                                endLine++;
                                endColumn = 0;
                            } else {
                                endColumn++;
                            }
                        }
                    }

                    locations.push({
                        column: matched.index,
                        endColumn,
                        endLine,
                        line: i
                    });
                }
            });

            return locations;
        };

        const getMatchInformation = (text: string): MatchInformation => {
            return {
                locations: getCurrentDoctypeProblemLocation(text),
                matches: text.match(doctypeRegExp)
            };
        };

        const checkNoDoctypeInContent = (matchInfo: MatchInformation, resource: string, content: string, standards: boolean): boolean => {
            if (matchInfo.matches && matchInfo.matches.length > 0) {
                return true;
            }

            if (!doctypeFlexibleRegExp.exec(content)) {
                const fixes: {location: ProblemLocation; text: string}[] = [
                    {
                        location: {
                            column: 0,
                            endColumn: 0,
                            endLine: 0,
                            line: 0
                        },
                        text: `<!doctype html>${os.EOL}`
                    }
                ];

                context.report(
                    resource,
                    getMessage('doctypeNotSpecified', context.language),
                    {
                        fixes,
                        location: defaultProblemLocation,
                        severity: Severity.error
                    }
                );

                return false;
            }

            const severity = standards ? Severity.warning : Severity.error;

            const fixes: {location: ProblemLocation; text: string}[] = [
                {
                    location: {
                        column: 0,
                        endColumn: doctypeFlexibleRegExp.lastIndex,
                        endLine: 0,
                        line: 0
                    },
                    text: '<!doctype html>'
                }
            ];

            context.report(
                resource,
                getMessage('doctypeSpecifiedAs', context.language),
                {
                    fixes,
                    location: defaultProblemLocation,
                    severity
                }
            );

            return false;
        };

        const checkNoDoctypeInCorrectLine = (matchInfo: MatchInformation, resource: string, standards: boolean) => {
            const severity = standards ? Severity.warning : Severity.error;

            if (matchInfo.locations[0].line === correctLine) {
                return;
            }

            const doctypeText = matchInfo.matches && matchInfo.matches[0] || '<!doctype html>';

            if (!doctypeText) {
                return;
            }

            const fixes: {location: ProblemLocation; text: string}[] = [
                {
                    location: {
                        column: 0,
                        endColumn: 0,
                        endLine: 0,
                        line: 0
                    },
                    text: `${doctypeText}${os.EOL}`
                }
            ];

            for (const problemLocation of matchInfo.locations) {
                if (problemLocation.endColumn === undefined|| problemLocation.endLine === undefined) {
                    continue;
                }
                const fix = {
                    location: problemLocation,
                    text: ''
                };

                fixes.unshift(fix);
            }

            context.report(
                resource,
                getMessage('doctypeSpecifiedBefore', context.language),
                {
                    fixes,
                    location: matchInfo.locations[0],
                    severity
                }
            );
        };

        const checkDoctypeIsDuplicated = (matchInfo: MatchInformation, resource: string) => {
            if (!matchInfo.matches || matchInfo.matches.length < 2) {
                return;
            }

            const fixes: {location: ProblemLocation; text: string}[] = [];

            for (let i = matchInfo.locations.length - 1; i > 0; i--) {
                const fix = {
                    location: matchInfo.locations[i],
                    text: ''
                };

                fixes.push(fix);
            }

            context.report(
                resource,
                getMessage('doctypeNotDuplicated', context.language),
                {
                    fixes,
                    location: matchInfo.locations[matchInfo.locations.length - 1],
                    severity: Severity.warning
                }
            );
        };

        const onParseEndHTML = (parseEnd: HTMLParse) => {
            const { html, document, resource } = parseEnd;

            const standards = document.compatMode === 'CSS1Compat';
            const trimmedHtml = html.trim();

            const globalMatch = getMatchInformation(trimmedHtml);

            if (!checkNoDoctypeInContent(globalMatch, resource, trimmedHtml, standards)) {
                return;
            }

            checkNoDoctypeInCorrectLine(globalMatch, resource, standards);
            checkDoctypeIsDuplicated(globalMatch, resource);

            return;
        };

        context.on('parse::end::html', onParseEndHTML);
    }
}
