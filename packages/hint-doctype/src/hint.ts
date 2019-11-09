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
                    locations.push({
                        column: matched.index,
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
                context.report(
                    resource,
                    getMessage('doctypeNotSpecified', context.language),
                    {
                        location: defaultProblemLocation,
                        severity: Severity.error
                    }
                );

                return false;
            }

            const severity = standards ? Severity.warning : Severity.error;

            context.report(
                resource,
                getMessage('doctypeSpecifiedAs', context.language),
                {
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

            context.report(
                resource,
                getMessage('doctypeSpecifiedBefore', context.language),
                {
                    location: matchInfo.locations[0],
                    severity
                }
            );
        };

        const checkDoctypeIsDuplicated = (matchInfo: MatchInformation, resource: string) => {
            if (!matchInfo.matches || matchInfo.matches.length < 2) {
                return;
            }

            context.report(
                resource,
                getMessage('doctypeNotDuplicated', context.language),
                {
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
